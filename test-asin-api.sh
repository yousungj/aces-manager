#!/bin/bash
# Test script for ASIN Lookup API

API_URL="https://no5m3790j3.execute-api.us-east-1.amazonaws.com/default/asin-lookup"
TEST_ASIN="B0DDCT3LRV"  # Replace with a real ASIN from your catalog

echo "Testing ASIN Lookup API..."
echo "API URL: $API_URL"
echo "Test ASIN: $TEST_ASIN"
echo ""
echo "Sending request..."
echo ""

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"asin\":\"$TEST_ASIN\"}" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s | jq '.' 2>/dev/null || curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"asin\":\"$TEST_ASIN\"}" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s

echo ""
echo "Test complete!"
