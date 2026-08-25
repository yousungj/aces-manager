#!/bin/bash
# Test script for Walmart SKU Lookup API
# Prereq: deploy aws-lambda/walmart-sku-lookup.js behind the same API Gateway
# as asin-lookup, at route /walmart-sku-lookup (see aws-lambda/README notes).

API_URL="https://no5m3790j3.execute-api.us-east-1.amazonaws.com/default/walmart-sku-lookup"
TEST_SKU="CATC-843"  # Replace with a real SKU from your Walmart catalog

echo "Testing Walmart SKU Lookup API..."
echo "API URL: $API_URL"
echo "Test SKU: $TEST_SKU"
echo ""
echo "Sending request..."
echo ""

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"sku\":\"$TEST_SKU\"}" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"sku\":\"$TEST_SKU\"}" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "Test complete!"
