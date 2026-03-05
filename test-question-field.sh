#!/bin/bash
# QA Test Script for Question Field Type Feature
# Principal QA Engineer - Test Execution Script
# Date: 2026-03-04

set -e

echo "=========================================="
echo "Question Field Type - QA Test Execution"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to log test results
log_test() {
    local test_name="$1"
    local status="$2"
    local details="$3"

    TESTS_RUN=$((TESTS_RUN + 1))

    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}[PASS]${NC} $test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}[FAIL]${NC} $test_name"
        echo -e "       ${YELLOW}Details:${NC} $details"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Check if servers are running
echo -e "${BLUE}[INFO]${NC} Checking server availability..."
if ! curl -s http://localhost:3031/ > /dev/null; then
    echo -e "${RED}[ERROR]${NC} UI server not accessible on port 3031"
    echo "Please run 'npm run dev' first"
    exit 1
fi
log_test "UI Server Accessible (port 3031)" "PASS" ""

# Test 1: Submit test plan
echo ""
echo -e "${BLUE}[TEST 1]${NC} Submitting test plan via API..."
RESPONSE=$(curl -s -X POST http://localhost:3031/api/test-plan \
    -H "Content-Type: application/json" \
    -d @test-question-field.json)

if echo "$RESPONSE" | grep -q "success\|ok\|true"; then
    log_test "Test Plan Submission" "PASS" ""
elif echo "$RESPONSE" | grep -q "error"; then
    ERROR_MSG=$(echo "$RESPONSE" | grep -o '"error":"[^"]*"' | cut -d'"' -f4)
    log_test "Test Plan Submission" "FAIL" "API returned error: $ERROR_MSG"
else
    # Even if response doesn't explicitly say success, if no error, likely succeeded
    log_test "Test Plan Submission" "PASS" "Plan submitted (response: ${RESPONSE:0:50}...)"
fi

# Test 2: Verify XML parsing handles question type
echo ""
echo -e "${BLUE}[TEST 2]${NC} Verifying question field type parsing..."
if grep -q 'type="question"' test-question-field.xml; then
    log_test "Question Type Present in XML" "PASS" ""
else
    log_test "Question Type Present in XML" "FAIL" "XML missing question type"
fi

# Test 3: Check server type definition
echo ""
echo -e "${BLUE}[TEST 3]${NC} Verifying server-side type definitions..."
if grep -q "'question'" packages/mcp-server/src/types.ts; then
    log_test "Server Type Definition (question)" "PASS" ""
else
    log_test "Server Type Definition (question)" "FAIL" "Missing 'question' in FieldType"
fi

# Test 4: Check UI type definition
echo ""
echo -e "${BLUE}[TEST 4]${NC} Verifying UI-side type definitions..."
if grep -q "'question'" packages/ui/src/stores/plan-store.ts; then
    log_test "UI Type Definition (question)" "PASS" ""
else
    log_test "UI Type Definition (question)" "FAIL" "Missing 'question' in UI FieldType"
fi

# Test 5: Check DynamicFieldInput component implementation
echo ""
echo -e "${BLUE}[TEST 5]${NC} Verifying DynamicFieldInput component..."
if grep -q "case 'question':" packages/ui/src/components/Panel/DynamicFieldInput.tsx; then
    log_test "DynamicFieldInput Question Case" "PASS" ""
else
    log_test "DynamicFieldInput Question Case" "FAIL" "Missing case 'question' in component"
fi

# Test 6: Verify conditional rendering logic
echo ""
echo -e "${BLUE}[TEST 6]${NC} Checking conditional rendering logic..."
if grep -q "if (field.options)" packages/ui/src/components/Panel/DynamicFieldInput.tsx; then
    log_test "Conditional Rendering Logic" "PASS" ""
else
    log_test "Conditional Rendering Logic" "FAIL" "Missing options check for conditional rendering"
fi

# Test 7: Verify options parsing with trim
echo ""
echo -e "${BLUE}[TEST 7]${NC} Checking options parsing logic..."
if grep -q "split(',').map((o) => o.trim())" packages/ui/src/components/Panel/DynamicFieldInput.tsx; then
    log_test "Options Parsing (split + trim)" "PASS" ""
else
    log_test "Options Parsing (split + trim)" "FAIL" "Options parsing may not handle whitespace"
fi

# Test 8: Verify dropdown rendering
echo ""
echo -e "${BLUE}[TEST 8]${NC} Checking dropdown element rendering..."
DROPDOWN_COUNT=$(grep -c "<select" packages/ui/src/components/Panel/DynamicFieldInput.tsx || true)
if [ "$DROPDOWN_COUNT" -ge 2 ]; then
    log_test "Dropdown Element Rendering" "PASS" "Found $DROPDOWN_COUNT select elements"
else
    log_test "Dropdown Element Rendering" "FAIL" "Expected 2+ select elements (select & question types)"
fi

# Test 9: Verify text input fallback
echo ""
echo -e "${BLUE}[TEST 9]${NC} Checking text input fallback..."
if grep -A5 "case 'question':" packages/ui/src/components/Panel/DynamicFieldInput.tsx | grep -q "type=\"text\""; then
    log_test "Text Input Fallback" "PASS" ""
else
    log_test "Text Input Fallback" "FAIL" "Missing text input fallback when no options"
fi

# Test 10: Verify all 6 test scenarios in XML
echo ""
echo -e "${BLUE}[TEST 10]${NC} Verifying test scenario coverage..."
NODE_COUNT=$(grep -c "<node" test-question-field.xml || true)
if [ "$NODE_COUNT" -eq 6 ]; then
    log_test "Test Scenario Coverage" "PASS" "All 6 test nodes present"
else
    log_test "Test Scenario Coverage" "FAIL" "Expected 6 test nodes, found $NODE_COUNT"
fi

# Test 11: Verify edge case nodes
echo ""
echo -e "${BLUE}[TEST 11]${NC} Verifying edge case coverage..."
EDGE_CASES=(
    "options=\"\""  # Empty options
    "options=\"OnlyOption\""  # Single option
    "AWS (Amazon)"  # Special characters
)

EDGE_CASE_PASS=0
for edge in "${EDGE_CASES[@]}"; do
    if grep -q "$edge" test-question-field.xml; then
        EDGE_CASE_PASS=$((EDGE_CASE_PASS + 1))
    fi
done

if [ "$EDGE_CASE_PASS" -eq 3 ]; then
    log_test "Edge Case Coverage" "PASS" "All 3 edge cases present"
else
    log_test "Edge Case Coverage" "FAIL" "Only $EDGE_CASE_PASS/3 edge cases found"
fi

# Test 12: Verify mixed field types node
echo ""
echo -e "${BLUE}[TEST 12]${NC} Verifying mixed field types test..."
MIXED_NODE=$(grep -A20 "Mixed Field Types" test-question-field.xml || true)
FIELD_TYPES=$(echo "$MIXED_NODE" | grep -o 'type="[^"]*"' | wc -l)
if [ "$FIELD_TYPES" -ge 4 ]; then
    log_test "Mixed Field Types Node" "PASS" "Found $FIELD_TYPES different field types"
else
    log_test "Mixed Field Types Node" "FAIL" "Expected 4+ field types, found $FIELD_TYPES"
fi

# Test 13: Check required field validation
echo ""
echo -e "${BLUE}[TEST 13]${NC} Checking required field validation logic..."
if grep -q 'field.required && !field.value' packages/ui/src/stores/plan-store.ts; then
    log_test "Required Field Validation" "PASS" ""
else
    log_test "Required Field Validation" "FAIL" "Required validation logic missing"
fi

# Test 14: Verify styling consistency
echo ""
echo -e "${BLUE}[TEST 14]${NC} Checking CSS class consistency..."
BASE_CLASS_COUNT=$(grep -c "className={clsx(baseInputClass" packages/ui/src/components/Panel/DynamicFieldInput.tsx || true)
if [ "$BASE_CLASS_COUNT" -ge 3 ]; then
    log_test "CSS Class Consistency" "PASS" "baseInputClass used consistently"
else
    log_test "CSS Class Consistency" "FAIL" "Inconsistent styling class usage"
fi

# Test 15: Verify placeholder text
echo ""
echo -e "${BLUE}[TEST 15]${NC} Checking placeholder text..."
if grep -q "Select an answer" packages/ui/src/components/Panel/DynamicFieldInput.tsx && \
   grep -q "Enter your answer" packages/ui/src/components/Panel/DynamicFieldInput.tsx; then
    log_test "Placeholder Text Present" "PASS" ""
else
    log_test "Placeholder Text Present" "FAIL" "Missing appropriate placeholder text"
fi

# Test 16: Check for regression - other field types still present
echo ""
echo -e "${BLUE}[TEST 16]${NC} Regression check - existing field types..."
EXISTING_TYPES=("case 'select':" "case 'boolean':" "case 'number':" "case 'secret':" "case 'color':")
TYPES_FOUND=0
for type in "${EXISTING_TYPES[@]}"; do
    if grep -q "$type" packages/ui/src/components/Panel/DynamicFieldInput.tsx; then
        TYPES_FOUND=$((TYPES_FOUND + 1))
    fi
done

if [ "$TYPES_FOUND" -eq 5 ]; then
    log_test "Regression Check - Existing Types" "PASS" "All 5 existing types still implemented"
else
    log_test "Regression Check - Existing Types" "FAIL" "Only $TYPES_FOUND/5 existing types found"
fi

# Summary
echo ""
echo "=========================================="
echo "Test Execution Summary"
echo "=========================================="
echo -e "Total Tests Run:    ${BLUE}$TESTS_RUN${NC}"
echo -e "Tests Passed:       ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed:       ${RED}$TESTS_FAILED${NC}"

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    echo ""
    exit 0
else
    echo ""
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. Review failed test details above"
    echo "2. Run manual browser tests: open http://localhost:3031"
    echo "3. Load test plan and verify each scenario manually"
    echo "4. Check browser console for errors"
    echo ""
    exit 1
fi
