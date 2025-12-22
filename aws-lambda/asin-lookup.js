/**
 * AWS Lambda Function: ASIN Lookup & ACES Fitment Checker
 * 
 * Uses Amazon SP-API to:
 * 1. Get part number from ASIN
 * 2. Get current fitment data from Amazon
 * 3. Check if ACES is live and matches expected data
 */

const https = require('https');
const crypto = require('crypto');

// Environment variables (set these in Lambda configuration)
const {
  SP_API_CLIENT_ID,
  SP_API_CLIENT_SECRET,
  SP_API_REFRESH_TOKEN,
  SP_API_REGION = 'us-east-1',
  MARKETPLACE_ID = 'ATVPDKIKX0DER' // US marketplace
} = process.env;

// SP-API endpoints
const TOKEN_URL = 'https://api.amazon.com/auth/o2/token';
const SP_API_ENDPOINT = 'https://sellingpartnerapi-na.amazon.com';

/**
 * Get access token from refresh token
 */
async function getAccessToken() {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: SP_API_REFRESH_TOKEN,
    client_id: SP_API_CLIENT_ID,
    client_secret: SP_API_CLIENT_SECRET
  });

  return new Promise((resolve, reject) => {
    const req = https.request(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.access_token) {
            resolve(result.access_token);
          } else {
            reject(new Error('No access token received'));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(params.toString());
    req.end();
  });
}

/**
 * Get product details from ASIN
 */
async function getProductDetails(accessToken, asin) {
  const path = `/catalog/2022-04-01/items/${asin}?marketplaceIds=${MARKETPLACE_ID}&includedData=attributes,identifiers`;
  
  return new Promise((resolve, reject) => {
    const req = https.request(`${SP_API_ENDPOINT}${path}`, {
      method: 'GET',
      headers: {
        'x-amz-access-token': accessToken,
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Get fitment data for ASIN
 * Note: This uses the Product Type Definitions API to get fitment attributes
 */
async function getFitmentData(accessToken, asin) {
  const path = `/catalog/2022-04-01/items/${asin}?marketplaceIds=${MARKETPLACE_ID}&includedData=attributes`;
  
  return new Promise((resolve, reject) => {
    const req = https.request(`${SP_API_ENDPOINT}${path}`, {
      method: 'GET',
      headers: {
        'x-amz-access-token': accessToken,
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Extract fitment information from product attributes
 */
function extractFitmentInfo(productData) {
  try {
    // Log the entire product data for debugging
    console.log('Product Data Keys:', Object.keys(productData));
    console.log('Attributes:', JSON.stringify(productData.attributes, null, 2));
    
    const attributes = productData.attributes;
    if (!attributes) return null;

    // Look for common fitment-related attributes
    const fitmentData = {
      vehicles: [],
      hasAces: false,
      vehicleCount: 0,
      lastUpdated: null
    };

    // Check for part_type_data (ACES fitment)
    if (attributes.part_type_data) {
      console.log('Found part_type_data');
      fitmentData.hasAces = true;
      // Extract vehicle applications if available
      if (attributes.part_type_data.vehicle_applications) {
        fitmentData.vehicles = attributes.part_type_data.vehicle_applications;
        fitmentData.vehicleCount = fitmentData.vehicles.length;
      }
    }

    // Check for automotive_fitment attribute
    if (attributes.automotive_fitment) {
      console.log('Found automotive_fitment:', attributes.automotive_fitment);
      fitmentData.hasAces = true;
      if (Array.isArray(attributes.automotive_fitment)) {
        fitmentData.vehicles = attributes.automotive_fitment;
        fitmentData.vehicleCount = attributes.automotive_fitment.length;
      }
    }

    // Check for automotive_fit_type (universal_fit or vehicle_specific)
    if (attributes.automotive_fit_type) {
      console.log('Automotive fit type:', attributes.automotive_fit_type);
      const fitType = attributes.automotive_fit_type[0]?.value || '';
      if (fitType === 'universal_fit') {
        fitmentData.hasAces = true;
        fitmentData.isUniversal = true;
        fitmentData.vehicleCount = -1; // Flag for universal
      } else if (fitType === 'vehicle_specific') {
        fitmentData.hasAces = true;
      }
    }

    // Check for item_type_name which might indicate automotive
    if (attributes.item_type_name) {
      console.log('Item type:', attributes.item_type_name);
      const itemType = attributes.item_type_name[0]?.value?.toLowerCase() || '';
      if (itemType.includes('auto') || itemType.includes('vehicle') || itemType.includes('car')) {
        fitmentData.hasAces = true;
      }
    }

    // Check for manufacturer compatibility data
    if (attributes.compatibility_make || attributes.compatibility_model || attributes.compatibility_year) {
      console.log('Found compatibility data');
      fitmentData.hasAces = true;
      // If we have compatibility data but no vehicle count, set a flag
      if (fitmentData.vehicleCount === 0) {
        fitmentData.vehicleCount = 1; // At least one vehicle is compatible
      }
    }

    console.log('Final fitment data:', fitmentData);
    return fitmentData;
  } catch (err) {
    console.error('Error extracting fitment info:', err);
    return null;
  }
}

/**
 * Extract part number from product data
 */
function extractPartNumber(productData) {
  try {
    // Try various locations where part number might be stored
    const attributes = productData.attributes || {};
    
    // Common locations for part numbers
    const partNumber = 
      attributes.manufacturer_part_number?.[0]?.value ||
      attributes.part_number?.[0]?.value ||
      attributes.model_number?.[0]?.value ||
      productData.identifiers?.manufacturerPartNumbers?.[0] ||
      null;

    return partNumber;
  } catch (err) {
    console.error('Error extracting part number:', err);
    return null;
  }
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
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Parse request
    const body = event.body ? JSON.parse(event.body) : {};
    const asin = body.asin || event.queryStringParameters?.asin;

    if (!asin) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'ASIN is required'
        })
      };
    }

    // Validate ASIN format
    if (!/^B[0-9A-Z]{9}$/.test(asin)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid ASIN format'
        })
      };
    }

    console.log('Looking up ASIN:', asin);

    // Get access token
    const accessToken = await getAccessToken();

    // Get product details
    const productData = await getProductDetails(accessToken, asin);

    // Check for errors in response
    if (productData.errors && productData.errors.length > 0) {
      console.log('API returned errors:', JSON.stringify(productData.errors));
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: productData.errors[0].message || 'Product not found or access denied',
          asin
        })
      };
    }

    // Extract part number
    const partNumber = extractPartNumber(productData);

    // Get fitment data
    const fitmentData = extractFitmentInfo(productData);

    // Build response
    const response = {
      success: true,
      asin,
      partNumber,
      fitmentStatus: {
        hasAces: fitmentData?.hasAces || false,
        vehicleCount: fitmentData?.vehicleCount || 0,
        status: determineFitmentStatus(fitmentData),
        lastChecked: new Date().toISOString()
      },
      rawData: {
        productTitle: productData.attributes?.item_name?.[0]?.value || 'Unknown',
        brand: productData.attributes?.brand?.[0]?.value || 'Unknown'
      }
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response)
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Internal server error'
      })
    };
  }
};

/**
 * Determine fitment status
 */
function determineFitmentStatus(fitmentData) {
  if (!fitmentData) {
    return 'NO_DATA';
  }
  
  // Universal fit products
  if (fitmentData.isUniversal || fitmentData.vehicleCount === -1) {
    return 'UNIVERSAL';
  }
  
  if (fitmentData.hasAces && fitmentData.vehicleCount > 0) {
    return 'LIVE';
  }
  
  if (fitmentData.hasAces && fitmentData.vehicleCount === 0) {
    return 'PENDING';
  }
  
  return 'NO_FITMENT';
}
