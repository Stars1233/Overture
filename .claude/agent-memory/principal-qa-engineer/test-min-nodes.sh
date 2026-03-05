#!/bin/bash
# Test script for minimum nodes validation feature

echo "=== Testing Minimum Nodes Per Plan Feature ==="
echo ""

# Test 1: Submit 2-node plan (should fail if min nodes = 5)
echo "Test 1: Submitting 2-node plan..."
echo "Expected: Rejection if minNodesPerPlan >= 3"
curl -X POST http://localhost:3031/api/test-plan \
  -H "Content-Type: application/xml" \
  --data @test-min-nodes-fail.xml
echo ""
echo ""

# Test 2: Submit 5-node plan (should always pass)
echo "Test 2: Submitting 5-node plan..."
echo "Expected: Success"
curl -X POST http://localhost:3031/api/test-plan \
  -H "Content-Type: application/xml" \
  --data @test-min-nodes-pass.xml
echo ""
echo ""

echo "=== Test Complete ==="
echo "Check the UI at http://localhost:3031 to see results"
echo "Check server logs for validation messages"
