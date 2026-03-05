#!/bin/bash
# Requirements Checklist Field Fix - Manual Test Script
# Date: 2026-03-04
# Usage: ./test-requirements-checklist.sh

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Requirements Checklist Field Fix Test${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# Check if servers are running
echo -e "${YELLOW}[1/4] Checking servers...${NC}"
if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3031 | grep -q "200"; then
  echo -e "${RED}ERROR: HTTP server not running on port 3031${NC}"
  echo "Please run: npm run dev"
  exit 1
fi

if ! lsof -i :3030 | grep -q LISTEN; then
  echo -e "${RED}ERROR: WebSocket server not running on port 3030${NC}"
  echo "Please run: npm run dev"
  exit 1
fi

echo -e "${GREEN}✓ HTTP server running (port 3031)${NC}"
echo -e "${GREEN}✓ WebSocket server running (port 3030)${NC}"
echo ""

# Submit test plan
echo -e "${YELLOW}[2/4] Submitting test plan...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:3031/api/test-plan \
  -H "Content-Type: application/xml" \
  -w "\nHTTP_CODE:%{http_code}" \
  --data-binary @test-requirements-checklist.xml)

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" != "200" ]; then
  echo -e "${RED}ERROR: Failed to submit test plan (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
  exit 1
fi

echo -e "${GREEN}✓ Test plan submitted successfully${NC}"
echo ""

# Display test plan summary
echo -e "${YELLOW}[3/4] Test Plan Summary${NC}"
echo "Plan ID: test-requirements-checklist"
echo "Nodes:"
echo "  - node1: Required and Optional Fields (3 fields: 2 req, 1 opt)"
echo "  - node2: All Optional Fields (2 fields: 0 req, 2 opt)"
echo "  - node3: Default Values Test (SKIP - not supported)"
echo "  - node4: All Required Fields (2 fields: 2 req, 0 opt)"
echo "  - node5: Empty Node (should NOT appear in checklist)"
echo ""
echo "Expected Checklist Items: 7 fields total (4 required, 3 optional)"
echo ""

# Open browser
echo -e "${YELLOW}[4/4] Opening browser...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open http://localhost:3031
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  # Linux
  xdg-open http://localhost:3031 2>/dev/null || echo "Please open http://localhost:3031 manually"
else
  echo "Please open http://localhost:3031 manually"
fi

echo -e "${GREEN}✓ Browser opened${NC}"
echo ""

# Display manual test instructions
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Manual Testing Instructions${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo "STEP 1: Verify Requirements Checklist Appears"
echo "  Expected:"
echo "    - Checklist visible on left side"
echo "    - Shows 4 nodes (NOT node5 - it has no fields)"
echo "    - Total: 7 fields (4 required, 3 optional)"
echo ""
echo "STEP 2: Verify Optional Field Visibility"
echo "  Focus: node2 (all optional fields)"
echo "  Expected:"
echo "    - Both fields shown with '(optional)' label"
echo "    - Dimmed/muted styling"
echo "    - Circle icons (not yellow warning)"
echo ""
echo "STEP 3: Verify Required vs Optional Styling"
echo "  Focus: node1 (mixed fields)"
echo "  Expected:"
echo "    - Required fields: Yellow circles when empty"
echo "    - Optional field: Dimmed circle when empty"
echo "    - '(optional)' label on project_description only"
echo ""
echo "STEP 4: Verify Progress Calculation"
echo "  Action: Fill ONLY required fields"
echo "    1. Fill node1.project_name (required)"
echo "    2. Fill node1.environment (required)"
echo "    3. Fill node4.api_key (required)"
echo "    4. Fill node4.timeout (required)"
echo "    5. DO NOT fill optional fields"
echo "  Expected:"
echo "    - Progress bar reaches 100%"
echo "    - Footer: 'All requirements complete! Ready to approve'"
echo "    - Counter: '4/7' (4 filled, 7 total)"
echo ""
echo -e "${RED}STEP 5: CRITICAL TEST - Approval with Empty Optional Fields${NC}"
echo "  Precondition:"
echo "    - All required fields filled (4)"
echo "    - All optional fields empty (3)"
echo "    - Progress bar at 100%"
echo "  Action: Click Approve button"
echo "  Expected:"
echo "    ✓ Approval succeeds"
echo "    ✗ No blocking error"
echo "  ${RED}IF THIS FAILS: CRITICAL BUG${NC}"
echo ""
echo "STEP 6: Verify Value Display"
echo "  Action: Fill a field and observe"
echo "  Expected:"
echo "    - Field value appears in green text"
echo "    - Green checkmark icon"
echo "    - Text color changes to muted"
echo ""
echo "STEP 7: Verify Node Navigation"
echo "  Action: Click checklist items"
echo "  Expected:"
echo "    - Node selected on canvas"
echo "    - NodeDetailPanel opens"
echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${YELLOW}After testing, document results in:${NC}"
echo "/Users/Opeyemi/Downloads/sixth-mcp/overture/.claude/agent-memory/principal-qa-engineer/TEST_REPORT_REQUIREMENTS_CHECKLIST_FIX.md"
echo -e "${GREEN}=====================================${NC}"
