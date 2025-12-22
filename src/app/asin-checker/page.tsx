'use client';

import React, { useState } from "react";
import Link from "next/link";

type AsinLookupResult = {
  success: boolean;
  asin: string;
  partNumber: string | null;
  fitmentStatus: {
    hasAces: boolean;
    vehicleCount: number;
    status: 'LIVE' | 'PENDING' | 'NO_FITMENT' | 'NO_DATA' | 'UNIVERSAL';
    lastChecked: string;
  };
  rawData: {
    productTitle: string;
    brand: string;
  };
  error?: string;
};

type BulkResult = AsinLookupResult & {
  category?: string;
};

export default function AsinChecker() {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [asin, setAsin] = useState("");
  const [bulkAsins, setBulkAsins] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AsinLookupResult | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkResult[]>([]);
  const [error, setError] = useState("");
  const [copiedPartNumber, setCopiedPartNumber] = useState<string | null>(null);

  const copyPartNumber = async (partNumber: string) => {
    try {
      await navigator.clipboard.writeText(partNumber);
      setCopiedPartNumber(partNumber);
      setTimeout(() => setCopiedPartNumber(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const parseBulkAsins = (text: string): string[] => {
    const asins: string[] = [];
    const seen = new Set<string>();
    const lines = text.split(/[\n,]+/);
    
    for (const line of lines) {
      const trimmed = line.trim().toUpperCase();
      if (!trimmed || trimmed.startsWith("#")) continue;
      
      // Validate ASIN format
      if (/^B[0-9A-Z]{9}$/.test(trimmed)) {
        if (!seen.has(trimmed)) {
          seen.add(trimmed);
          asins.push(trimmed);
        }
      }
    }
    return asins;
  };

  const handleLookup = async () => {
    if (mode === "single") {
      await handleSingleLookup();
    } else {
      await handleBulkLookup();
    }
  };

  const handleSingleLookup = async () => {
    if (!asin.trim()) {
      setError("Please enter an ASIN");
      return;
    }

    // Validate ASIN format
    const asinPattern = /^B[0-9A-Z]{9}$/;
    if (!asinPattern.test(asin.trim())) {
      setError("Invalid ASIN format. Should be like B0ABCD1234");
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

      const response = await fetch(`${apiUrl}/asin-lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ asin: asin.trim() })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Failed to lookup ASIN");
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setError(err instanceof Error ? err.message : "Failed to lookup ASIN. Please check your API configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkLookup = async () => {
    const asins = parseBulkAsins(bulkAsins);
    
    if (asins.length === 0) {
      setError("Please enter at least one valid ASIN");
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

      const results: BulkResult[] = [];
      
      // Process ASINs sequentially to avoid rate limiting
      for (let i = 0; i < asins.length; i++) {
        const asinCode = asins[i];
        
        try {
          const response = await fetch(`${apiUrl}/asin-lookup`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ asin: asinCode })
          });

          const data = await response.json();
          
          if (data.success) {
            results.push(data);
          } else {
            // Add error result
            results.push({
              success: false,
              asin: asinCode,
              partNumber: null,
              fitmentStatus: {
                hasAces: false,
                vehicleCount: 0,
                status: 'NO_DATA',
                lastChecked: new Date().toISOString()
              },
              rawData: {
                productTitle: 'Error: ' + (data.error || 'Unknown error'),
                brand: 'N/A'
              }
            });
          }

          // Update results incrementally
          setBulkResults([...results]);
          
          // Small delay to avoid rate limiting
          if (i < asins.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (err) {
          console.error(`Error looking up ${asinCode}:`, err);
          results.push({
            success: false,
            asin: asinCode,
            partNumber: null,
            fitmentStatus: {
              hasAces: false,
              vehicleCount: 0,
              status: 'NO_DATA',
              lastChecked: new Date().toISOString()
            },
            rawData: {
              productTitle: 'Error: Network error',
              brand: 'N/A'
            }
          });
          setBulkResults([...results]);
        }
      }
    } catch (err) {
      console.error("Bulk lookup error:", err);
      setError(err instanceof Error ? err.message : "Failed to perform bulk lookup.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'text-green-600 bg-green-50';
      case 'UNIVERSAL': return 'text-blue-600 bg-blue-50';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      case 'NO_FITMENT': return 'text-orange-600 bg-orange-50';
      case 'NO_DATA': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'LIVE': return '✅';
      case 'UNIVERSAL': return '🌐';
      case 'PENDING': return '⏳';
      case 'NO_FITMENT': return '⚠️';
      case 'NO_DATA': return '❌';
      default: return '❓';
    }
  };

  const getStatusMessage = (status: string, vehicleCount: number) => {
    switch (status) {
      case 'LIVE': return `ACES Live - ${vehicleCount} vehicles`;
      case 'UNIVERSAL': return 'Universal Fit';
      case 'PENDING': return 'ACES Pending - Processing';
      case 'NO_FITMENT': return 'No fitment data found';
      case 'NO_DATA': return 'No ACES data available';
      default: return 'Unknown status';
    }
  };

  const openAmazonPage = () => {
    if (asin) {
      window.open(`https://www.amazon.com/dp/${asin.trim()}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium mb-4 inline-block">
            ← Back to ACES Manager
          </Link>
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 bg-clip-text text-transparent" style={{ letterSpacing: '-0.04em' }}>
            ASIN Checker
          </h1>
          <p className="text-gray-500 text-lg">Lookup part numbers and check ACES fitment status on Amazon</p>
        </div>

        <div className="glass-card rounded-3xl p-8 mb-6">
          <div className="mb-6">
            <div className="flex gap-2 p-1.5 bg-gray-100 rounded-2xl mb-6 inline-flex">
              <button 
                onClick={() => setMode("single")} 
                className={`px-6 py-2.5 rounded-xl font-medium transition-all duration-200 ${mode === "single" ? "bg-white text-gray-900 shadow-md" : "text-gray-600 hover:text-gray-900"}`}
              >
                Single ASIN
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
                Amazon ASIN
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="B0ABCD1234"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white/50"
                  value={asin}
                  onChange={(e) => setAsin(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
                  maxLength={10}
                />
                <button
                  onClick={handleLookup}
                  disabled={isLoading}
                  className="apple-btn apple-btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Checking...' : 'Lookup'}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Enter a 10-character Amazon ASIN (e.g., B0ABCD1234)
              </p>
            </div>
          ) : (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bulk ASINs (one per line or comma-separated)
              </label>
              <textarea
                className="w-full h-48 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-mono text-sm bg-white/50 resize-none"
                placeholder="B0ABCD1234&#10;B0EFGH5678&#10;B0IJKL9012"
                value={bulkAsins}
                onChange={(e) => setBulkAsins(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter multiple ASINs (one per line or comma-separated). Lines starting with # are ignored.
              </p>
              <button
                onClick={handleLookup}
                disabled={isLoading}
                className="apple-btn apple-btn-primary px-8 py-3 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? `Checking... (${bulkResults.length} processed)` : 'Lookup All ASINs'}
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {mode === "bulk" && bulkResults.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Results ({bulkResults.length} ASINs)
                </h3>
                <button
                  onClick={() => {
                    setBulkResults([]);
                    setBulkAsins("");
                  }}
                  className="apple-btn apple-btn-secondary px-4 py-2 text-sm"
                >
                  Clear Results
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white rounded-xl overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ASIN</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Part Number</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Brand</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-sm">
                          <a 
                            href={`https://www.amazon.com/dp/${item.asin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {item.asin}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {item.partNumber ? (
                            <div className="flex items-center gap-2">
                              <span>{item.partNumber}</span>
                              <button
                                onClick={() => copyPartNumber(item.partNumber!)}
                                className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                                title="Copy part number"
                              >
                                {copiedPartNumber === item.partNumber ? (
                                  <span className="text-green-600">✓</span>
                                ) : (
                                  <span>📋</span>
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not found</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">{item.rawData.brand}</td>
                        <td className="px-4 py-3 text-sm">{item.category || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm max-w-xs truncate" title={item.rawData.productTitle}>
                          {item.rawData.productTitle}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
                            item.fitmentStatus.status === 'LIVE' ? 'bg-green-50 text-green-700' :
                            item.fitmentStatus.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700' :
                            item.fitmentStatus.status === 'NO_FITMENT' ? 'bg-orange-50 text-orange-700' :
                            'bg-gray-50 text-gray-700'
                          }`}>
                            {getStatusIcon(item.fitmentStatus.status)}
                            {item.fitmentStatus.status}
                            {item.fitmentStatus.vehicleCount > 0 && ` (${item.fitmentStatus.vehicleCount})`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {mode === "single" && result && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Product Title</p>
                    <p className="font-semibold text-gray-900">{result.rawData.productTitle}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Brand</p>
                    <p className="font-semibold text-gray-900">{result.rawData.brand}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <p className="text-sm text-gray-600 mb-2">Part Number</p>
                  {result.partNumber ? (
                    <div className="flex items-center gap-3">
                      <p className="text-2xl font-bold text-gray-900">
                        {result.partNumber}
                      </p>
                      <button
                        onClick={() => copyPartNumber(result.partNumber!)}
                        className="apple-btn apple-btn-secondary px-4 py-2 text-sm"
                        title="Copy part number"
                      >
                        {copiedPartNumber === result.partNumber ? '✓ Copied!' : '📋 Copy'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold text-gray-400">Not found</p>
                  )}
                </div>

                <div className={`border rounded-xl p-6 ${getStatusColor(result.fitmentStatus.status)}`}>
                  <p className="text-sm mb-2 opacity-80">ACES Fitment Status</p>
                  <p className="text-2xl font-bold mb-2">
                    {getStatusIcon(result.fitmentStatus.status)} {getStatusMessage(result.fitmentStatus.status, result.fitmentStatus.vehicleCount)}
                  </p>
                  <p className="text-xs opacity-70">
                    Last checked: {new Date(result.fitmentStatus.lastChecked).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={openAmazonPage}
                  className="apple-btn apple-btn-secondary px-6 py-3"
                >
                  🔗 View on Amazon
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setAsin("");
                  }}
                  className="apple-btn apple-btn-secondary px-6 py-3"
                >
                  Clear Results
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Status Legend</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-medium text-gray-900">LIVE</p>
                <p className="text-sm text-gray-600">ACES data is live on Amazon with vehicle fitments</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌐</span>
              <div>
                <p className="font-medium text-gray-900">UNIVERSAL</p>
                <p className="text-sm text-gray-600">Universal fit product - fits all/most vehicles</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⏳</span>
              <div>
                <p className="font-medium text-gray-900">PENDING</p>
                <p className="text-sm text-gray-600">ACES data submitted but still processing (can take 24-48 hours)</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-medium text-gray-900">NO FITMENT</p>
                <p className="text-sm text-gray-600">Product found but no fitment data available</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-medium text-gray-900">NO DATA</p>
                <p className="text-sm text-gray-600">Unable to retrieve product information</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
