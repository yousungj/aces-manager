/**
 * AWS Lambda Function: Walmart SKU Lookup & Listing Status Checker
 *
 * Uses the Walmart Marketplace API to:
 * 1. Look up an item by seller SKU
 * 2. Return listing status (published/lifecycle), product info, ids, and price
 *
 * Mirrors the asin-lookup.js pattern: credentials live in AWS Secrets Manager,
 * CORS-friendly responses, POST body { sku } or ?sku= query param.
 *
 * Secrets required (create in Secrets Manager, same region as the Lambda):
 *   walmart/client_id      - Walmart Marketplace API Client ID
 *   walmart/client_secret  - Walmart Marketplace API Client Secret
 * (Generate both in Walmart Seller Center -> Developer Portal -> API Keys)
 */

const https = require('https');
const crypto = require('crypto');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

// Non-secret configuration from environment variables
const {
  WM_API_REGION = 'us-east-1',
  // Secret names in AWS Secrets Manager (override via env if renamed)
  SECRET_WM_CLIENT_ID = 'walmart/client_id',
  SECRET_WM_CLIENT_SECRET = 'walmart/client_secret'
} = process.env;

const WM_API_HOST = 'marketplace.walmartapis.com';
const WM_SVC_NAME = 'Walmart Marketplace';

// Secrets Manager client + module-level caches (reused across warm invocations)
const secretsClient = new SecretsManagerClient({ region: WM_API_REGION });
let cachedCredentials = null;
let cachedToken = null; // { accessToken, expiresAt }

async function getSecretValue(secretId) {
  const result = await secretsClient.send(new GetSecretValueCommand({ SecretId: secretId }));
  return (result.SecretString || '').trim();
}

async function getCredentials() {
  if (cachedCredentials) return cachedCredentials;

  const [clientId, clientSecret] = await Promise.all([
    getSecretValue(SECRET_WM_CLIENT_ID),
    getSecretValue(SECRET_WM_CLIENT_SECRET)
  ]);

  if (!clientId || !clientSecret) {
    throw new Error('Walmart API credentials are missing from Secrets Manager');
  }

  cachedCredentials = { clientId, clientSecret };
  return cachedCredentials;
}

/**
 * Get an access token (client_credentials grant). Walmart tokens last ~15
 * minutes; cache with a 60s safety margin across warm invocations.
 */
async function getAccessToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.accessToken;
  }

  const { clientId, clientSecret } = await getCredentials();
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const body = 'grant_type=client_credentials';

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: WM_API_HOST,
      path: '/v3/token',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'WM_SVC.NAME': WM_SVC_NAME,
        'WM_QOS.CORRELATION_ID': crypto.randomUUID()
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Token endpoint status:', res.statusCode);
        try {
          const result = JSON.parse(data);
          if (result.access_token) {
            cachedToken = {
              accessToken: result.access_token,
              expiresAt: Date.now() + (Number(result.expires_in) || 900) * 1000
            };
            resolve(result.access_token);
          } else {
            console.log('Token endpoint error body:', data);
            reject(new Error('No access token received: ' + (result.error_description || result.error || data)));
          }
        } catch (err) {
          reject(new Error('Token response parse error: ' + data.slice(0, 300)));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Look up an item by seller SKU
 */
async function getItemBySku(accessToken, sku) {
  const path = `/v3/items/${encodeURIComponent(sku)}`;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: WM_API_HOST,
      path,
      method: 'GET',
      headers: {
        'WM_SEC.ACCESS_TOKEN': accessToken,
        'WM_SVC.NAME': WM_SVC_NAME,
        'WM_QOS.CORRELATION_ID': crypto.randomUUID(),
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Items API status:', res.statusCode);
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (err) {
          resolve({ statusCode: res.statusCode, body: { parseError: data.slice(0, 500) } });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Search the Walmart catalog by UPC to recover the public walmart.com itemId
 * (the seller Items API often omits it). Best-effort: returns null on any miss.
 */
async function catalogItemIdByUpc(accessToken, upc) {
  if (!upc) return null;
  const path = `/v3/items/walmart/search?upc=${encodeURIComponent(upc)}`;

  return new Promise((resolve) => {
    const req = https.request({
      hostname: WM_API_HOST,
      path,
      method: 'GET',
      headers: {
        'WM_SEC.ACCESS_TOKEN': accessToken,
        'WM_SVC.NAME': WM_SVC_NAME,
        'WM_QOS.CORRELATION_ID': crypto.randomUUID(),
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result?.items?.[0]?.itemId || null);
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.end();
  });
}

/**
 * Derive the manufacturer part number used in ACES <Part> from the seller SKU
 * by stripping a marketplace suffix after the last underscore
 * (e.g. "CATC-843_WMP1" -> "CATC-843"). Returned as `acesPartNumber` with
 * derived=true so the UI can label it; the authoritative MPN lives in the
 * listing's item spec, which the Marketplace API does not expose per-SKU.
 */
function derivePartNumber(sku) {
  const stripped = sku.replace(/_[^_]*$/, '');
  return stripped && stripped !== sku ? stripped : sku;
}

/**
 * Map Walmart publishedStatus/lifecycleStatus to a display status,
 * loosely matching the ASIN checker's status vocabulary.
 */
function determineListingStatus(item) {
  const published = (item.publishedStatus || '').toUpperCase();
  const lifecycle = (item.lifecycleStatus || '').toUpperCase();

  if (lifecycle === 'RETIRED' || lifecycle === 'ARCHIVED') return 'RETIRED';
  if (published === 'PUBLISHED') return 'LIVE';
  if (published === 'UNPUBLISHED') return 'UNPUBLISHED';
  if (published === 'IN_PROGRESS' || published === 'STAGE') return 'PENDING';
  if (published === 'SYSTEM_PROBLEM') return 'ERROR';
  return published || lifecycle || 'NO_DATA';
}

/**
 * Main Lambda handler
 */
exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const sku = (body.sku || event.queryStringParameters?.sku || '').trim();

    if (!sku) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'SKU is required' })
      };
    }

    // Seller SKUs are free-form; just guard against junk input
    if (sku.length > 100 || /\s/.test(sku)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Invalid SKU format', sku })
      };
    }

    console.log('Looking up Walmart SKU:', sku);

    const accessToken = await getAccessToken();
    const { statusCode, body: itemData } = await getItemBySku(accessToken, sku);

    // Walmart error payloads: { errors: { error: [{ code, description ... }] } } or an "error" array
    const wmErrors = itemData?.errors?.error || itemData?.error;
    if (statusCode !== 200 || wmErrors) {
      const first = Array.isArray(wmErrors) ? wmErrors[0] : wmErrors;
      const message = first?.description || first?.info || first?.code ||
        (statusCode === 404 ? 'SKU not found in your Walmart catalog' : `Walmart API error (HTTP ${statusCode})`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, error: message, sku })
      };
    }

    // Response shape: { ItemResponse: [ { ...item } ] }
    const item = itemData?.ItemResponse?.[0];
    if (!item) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, error: 'SKU not found in your Walmart catalog', sku })
      };
    }

    // Seller item payload often lacks the public itemId; recover it via
    // catalog search on the UPC so the walmart.com link works.
    const itemId = item.itemId || await catalogItemIdByUpc(accessToken, item.upc || item.gtin);

    const response = {
      success: true,
      sku: item.sku || sku,
      acesPartNumber: derivePartNumber(item.sku || sku),
      wpid: item.wpid || null,           // Walmart item id
      itemId,
      gtin: item.gtin || null,
      upc: item.upc || null,
      productName: item.productName || 'Unknown',
      productType: item.productType || null,
      shelf: item.shelf || null,
      price: item.price ? `${item.price.amount} ${item.price.currency || 'USD'}` : null,
      publishedStatus: item.publishedStatus || null,
      lifecycleStatus: item.lifecycleStatus || null,
      unpublishedReasons: item.unpublishedReasons?.reason || [],
      status: determineListingStatus(item),
      itemPageUrl: itemId ? `https://www.walmart.com/ip/${itemId}` : null,
      lastChecked: new Date().toISOString()
    };

    return { statusCode: 200, headers, body: JSON.stringify(response) };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message || 'Internal server error' })
    };
  }
};
