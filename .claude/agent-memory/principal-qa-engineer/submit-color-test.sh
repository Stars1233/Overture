#!/bin/bash

# Color Field Test Suite - Submission Script
# Tests all color field scenarios

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_URL="http://localhost:3031/api/test-plan"

echo "======================================"
echo "Color Field Type Test Suite"
echo "======================================"
echo ""

# Test 1: Basic color field rendering
echo "[1/4] Test: Basic Color Field Rendering"
echo "Plan: test-plan-color-basic.xml"
echo "Expected: Color picker + hex input render correctly with default values"
curl -X POST "$API_URL" \
  -H "Content-Type: application/xml" \
  -d @"$SCRIPT_DIR/test-plan-color-basic.xml" \
  -w "\nHTTP Status: %{http_code}\n\n"
sleep 2

# Test 2: Required color field validation
echo "[2/4] Test: Required Color Field Validation"
echo "Plan: test-plan-color-required.xml"
echo "Expected: Cannot approve without filling required color field"
curl -X POST "$API_URL" \
  -H "Content-Type: application/xml" \
  -d @"$SCRIPT_DIR/test-plan-color-required.xml" \
  -w "\nHTTP Status: %{http_code}\n\n"
sleep 2

# Test 3: Multiple independent color fields
echo "[3/4] Test: Multiple Independent Color Fields"
echo "Plan: test-plan-color-multiple.xml"
echo "Expected: All color fields operate independently without value bleeding"
curl -X POST "$API_URL" \
  -H "Content-Type: application/xml" \
  -d @"$SCRIPT_DIR/test-plan-color-multiple.xml" \
  -w "\nHTTP Status: %{http_code}\n\n"
sleep 2

# Test 4: Mixed field types including color
echo "[4/4] Test: Mixed Field Types with Color"
echo "Plan: test-plan-color-mixed-fields.xml"
echo "Expected: Color field works correctly alongside other field types"
curl -X POST "$API_URL" \
  -H "Content-Type: application/xml" \
  -d @"$SCRIPT_DIR/test-plan-color-mixed-fields.xml" \
  -w "\nHTTP Status: %{http_code}\n\n"

echo ""
echo "======================================"
echo "All test plans submitted successfully"
echo "======================================"
echo ""
echo "Manual Testing Protocol:"
echo "1. Open http://localhost:3031 in browser"
echo "2. For each test plan, verify:"
echo "   - Color picker renders (10x10 square, rounded)"
echo "   - Hex text input renders with monospace font"
echo "   - Both inputs show same value"
echo "   - Clicking color picker opens OS color chooser"
echo "   - Selecting color updates both picker and text"
echo "   - Typing hex value updates color picker preview"
echo "   - Required validation works (cannot approve without value)"
echo "   - Multiple color fields don't interfere with each other"
echo ""
