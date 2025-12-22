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
    status: 'LIVE' | 'PENDING' | 'NO_FITMENT' | 'NO_DATA';
    lastChecked: string;
  };
  rawData: {
    productTitle: string;
    brand: string;
  };
  error?: string;
};

export default function AsinChecker() {
  const [asin, setAsin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AsinLookupResult | null>(null);
  const [error, setError] = useState("");

  const handleLookup = async () => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'text-green-600 bg-green-50';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      case 'NO_FITMENT': return 'text-orange-600 bg-orange-50';
      case 'NO_DATA': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'LIVE': return '✅';
      case 'PENDING': return '⏳';
      case 'NO_FITMENT': return '⚠️';
      case 'NO_DATA': return '❌';
      default: return '❓';
    }
  };

  const getStatusMessage = (status: string, vehicleCount: number) => {
    switch (status) {
      case 'LIVE': return `ACES Live - ${vehicleCount} vehicles`;
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

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {result && (
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
                  <p className="text-2xl font-bold text-gray-900">
                    {result.partNumber || <span className="text-gray-400">Not found</span>}
                  </p>
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
