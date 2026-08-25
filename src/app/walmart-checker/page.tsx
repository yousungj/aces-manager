'use client';

import React, { useState } from "react";
import Link from "next/link";

type WalmartLookupResult = {
  success: boolean;
  sku: string;
  wpid: string | null;
  itemId: string | number | null;
  gtin: string | null;
  upc: string | null;
  productName: string;
  productType: string | null;
  shelf: string | null;
  price: string | null;
  publishedStatus: string | null;
  lifecycleStatus: string | null;
  unpublishedReasons: string[];
  status: string;
  itemPageUrl: string | null;
  lastChecked: string;
  error?: string;
};

function errorResult(sku: string, message: string): WalmartLookupResult {
  return {
    success: false,
    sku,
    wpid: null,
    itemId: null,
    gtin: null,
    upc: null,
    productName: 'Error: ' + message,
    productType: null,
    shelf: null,
    price: null,
    publishedStatus: null,
    lifecycleStatus: null,
    unpublishedReasons: [],
    status: 'NO_DATA',
    itemPageUrl: null,
    lastChecked: new Date().toISOString(),
    error: message,
  };
}

export default function WalmartChecker() {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [sku, setSku] = useState("");
  const [bulkSkus, setBulkSkus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WalmartLookupResult | null>(null);
  const [bulkResults, setBulkResults] = useState<WalmartLookupResult[]>([]);
  const [error, setError] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const parseBulkSkus = (text: string): string[] => {
    const skus: string[] = [];
    const seen = new Set<string>();
    const lines = text.split(/[\n,]+/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      if (trimmed.length > 100 || /\s/.test(trimmed)) continue; // seller SKUs are free-form, just skip junk
      if (!seen.has(trimmed)) {
        seen.add(trimmed);
        skus.push(trimmed);
      }
    }
    return skus;
  };

  const lookupSku = async (apiUrl: string, skuCode: string): Promise<WalmartLookupResult> => {
    const response = await fetch(`${apiUrl}/walmart-sku-lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku: skuCode })
    });
    const data = await response.json();
    if (data.success) return data as WalmartLookupResult;
    return errorResult(skuCode, data.error || 'Unknown error');
  };

  const handleSingleLookup = async () => {
    const trimmed = sku.trim();
    if (!trimmed) {
      setError("Please enter a SKU");
      return;
    }
    if (trimmed.length > 100 || /\s/.test(trimmed)) {
      setError("Invalid SKU: no spaces, max 100 characters");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.");
      }
      const data = await lookupSku(apiUrl, trimmed);
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Failed to lookup SKU");
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setError(err instanceof Error ? err.message : "Failed to lookup SKU. Please check your API configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkLookup = async () => {
    const skus = parseBulkSkus(bulkSkus);
    if (skus.length === 0) {
      setError("Please enter at least one valid SKU");
      return;
    }

    setIsLoading(true);
    setError("");
    setBulkResults([]);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error("API URL not configured. Please set NEXT_PUBLIC_API_URL environment variable.");
      }

      const results: WalmartLookupResult[] = [];
      // Process SKUs sequentially to avoid rate limiting
      for (let i = 0; i < skus.length; i++) {
        try {
          results.push(await lookupSku(apiUrl, skus[i]));
        } catch (err) {
          console.error(`Error looking up ${skus[i]}:`, err);
          results.push(errorResult(skus[i], 'Network error'));
        }
        setBulkResults([...results]);
        if (i < skus.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (err) {
      console.error("Bulk lookup error:", err);
      setError(err instanceof Error ? err.message : "Failed to perform bulk lookup.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLookup = async () => {
    if (mode === "single") await handleSingleLookup();
    else await handleBulkLookup();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'text-green-600 bg-green-50';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      case 'UNPUBLISHED': return 'text-orange-600 bg-orange-50';
      case 'RETIRED': return 'text-gray-600 bg-gray-100';
      case 'ERROR': return 'text-red-600 bg-red-50';
      case 'NO_DATA': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'LIVE': return '✅';
      case 'PENDING': return '⏳';
      case 'UNPUBLISHED': return '⚠️';
      case 'RETIRED': return '🗄️';
      case 'ERROR': return '❌';
      case 'NO_DATA': return '❌';
      default: return '❓';
    }
  };

  const getStatusMessage = (r: WalmartLookupResult) => {
    switch (r.status) {
      case 'LIVE': return 'Published - live on Walmart.com';
      case 'PENDING': return 'Processing - not yet published';
      case 'UNPUBLISHED': return 'Unpublished' + (r.unpublishedReasons.length ? `: ${r.unpublishedReasons.join('; ')}` : '');
      case 'RETIRED': return 'Retired / archived listing';
      case 'ERROR': return 'Walmart system problem';
      case 'NO_DATA': return r.error || 'No data';
      default: return r.publishedStatus || r.lifecycleStatus || 'Unknown status';
    }
  };

  const renderStatusChip = (r: WalmartLookupResult) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(r.status)}`}>
      {getStatusIcon(r.status)} {r.status}
    </span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to ACES Manager
          </Link>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent" style={{ letterSpacing: '-0.04em' }}>
            Walmart SKU Checker
          </h1>
          <p className="text-gray-500 text-lg">Lookup your seller SKUs and check listing status on Walmart Marketplace</p>
        </div>

        <div className="glass-card rounded-3xl p-8 mb-6">
          <div className="mb-6">
            <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-6 inline-flex">
              <button
                onClick={() => setMode("single")}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${mode === "single" ? "bg-white text-gray-900 shadow-md" : "text-gray-600 hover:text-gray-900"}`}
              >
                Single SKU
              </button>
              <button
                onClick={() => setMode("bulk")}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${mode === "bulk" ? "bg-white text-gray-900 shadow-md" : "text-gray-600 hover:text-gray-900"}`}
              >
                Bulk Lookup
              </button>
            </div>
          </div>

          {mode === "single" ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Walmart Seller SKU
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !isLoading) handleLookup(); }}
                placeholder="e.g. CATC-843"
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-900"
              />
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Walmart Seller SKUs (one per line or comma-separated, # for comments)
              </label>
              <textarea
                value={bulkSkus}
                onChange={(e) => setBulkSkus(e.target.value)}
                placeholder={"CATC-843\nCATC-844\nCATC-845"}
                rows={8}
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-gray-900 font-mono text-sm"
              />
            </div>
          )}

          {error && (
            <div className="mb-6 px-5 py-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={handleLookup}
            disabled={isLoading}
            className="apple-btn apple-btn-primary px-8 py-3.5 disabled:opacity-50"
          >
            {isLoading ? "Looking up..." : mode === "single" ? "🛒 Check SKU" : "🛒 Check All SKUs"}
          </button>
        </div>

        {result && (
          <div className="glass-card rounded-3xl p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">{result.productName}</h2>
                <p className="text-gray-500">
                  SKU: <span className="font-mono">{result.sku}</span>
                  {result.itemId && <> · Item ID: <span className="font-mono">{String(result.itemId)}</span></>}
                  {result.gtin && <> · GTIN: <span className="font-mono">{result.gtin}</span></>}
                </p>
              </div>
              {renderStatusChip(result)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="px-4 py-3 rounded-xl bg-gray-50">
                <span className="text-gray-500">Status: </span>
                <span className="text-gray-900 font-medium">{getStatusMessage(result)}</span>
              </div>
              <div className="px-4 py-3 rounded-xl bg-gray-50">
                <span className="text-gray-500">Lifecycle: </span>
                <span className="text-gray-900 font-medium">{result.lifecycleStatus || '—'}</span>
              </div>
              <div className="px-4 py-3 rounded-xl bg-gray-50">
                <span className="text-gray-500">Price: </span>
                <span className="text-gray-900 font-medium">{result.price || '—'}</span>
              </div>
              <div className="px-4 py-3 rounded-xl bg-gray-50">
                <span className="text-gray-500">Product Type: </span>
                <span className="text-gray-900 font-medium">{result.productType || '—'}</span>
              </div>
            </div>
            {result.itemPageUrl && (
              <a
                href={result.itemPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 text-blue-600 hover:text-blue-700 font-medium"
              >
                View on Walmart.com →
              </a>
            )}
          </div>
        )}

        {bulkResults.length > 0 && (
          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Results ({bulkResults.length})
              </h2>
              <button
                onClick={() => copyText(bulkResults.map(r => `${r.sku}\t${r.status}\t${r.productName}`).join('\n'), 'ALL')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                {copiedKey === 'ALL' ? '✓ Copied!' : 'Copy all as TSV'}
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-200">
                    <th className="py-3 pr-4">SKU</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Product</th>
                    <th className="py-3 pr-4">Price</th>
                    <th className="py-3 pr-4">Item ID</th>
                    <th className="py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {bulkResults.map((r, i) => (
                    <tr key={`${r.sku}-${i}`} className="border-b border-gray-100">
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => copyText(r.sku, r.sku + i)}
                          className="font-mono text-gray-900 hover:text-blue-600"
                          title="Click to copy"
                        >
                          {copiedKey === r.sku + i ? '✓ Copied!' : r.sku}
                        </button>
                      </td>
                      <td className="py-3 pr-4">{renderStatusChip(r)}</td>
                      <td className="py-3 pr-4 text-gray-700 max-w-md truncate" title={getStatusMessage(r)}>
                        {r.productName}
                      </td>
                      <td className="py-3 pr-4 text-gray-700 whitespace-nowrap">{r.price || '—'}</td>
                      <td className="py-3 pr-4 font-mono text-gray-500">{r.itemId ? String(r.itemId) : '—'}</td>
                      <td className="py-3">
                        {r.itemPageUrl && (
                          <a href={r.itemPageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                            View →
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
