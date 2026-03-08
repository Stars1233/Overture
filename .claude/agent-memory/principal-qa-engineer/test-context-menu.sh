#!/bin/bash

# Right-Click Context Menu Testing Script
# Usage: ./test-context-menu.sh [linear|branch|convergence|all]

BASE_DIR="/Users/Opeyemi/Downloads/sixth-mcp/overture"
MEMORY_DIR="$BASE_DIR/.claude/agent-memory/principal-qa-engineer"
API_URL="http://localhost:3031/api/test-plan"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to submit a test plan
submit_plan() {
    local plan_file=$1
    local plan_name=$2

    echo -e "${YELLOW}Submitting $plan_name...${NC}"

    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
        -H "Content-Type: application/xml" \
        -d @"$MEMORY_DIR/$plan_file" 2>&1)

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')

    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ $plan_name submitted successfully${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to submit $plan_name (HTTP $http_code)${NC}"
        echo "$body"
        return 1
    fi
}

# Function to check if server is running
check_server() {
    echo -e "${YELLOW}Checking if Overture server is running...${NC}"

    if curl -s -f "$API_URL" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Server is running${NC}"
        return 0
    else
        echo -e "${RED}✗ Server is not running${NC}"
        echo "Please start the server with: npm run dev"
        return 1
    fi
}

# Function to wait for user confirmation
wait_for_user() {
    echo -e "${YELLOW}Press Enter when ready to continue...${NC}"
    read
}

# Main test execution
main() {
    local test_type=${1:-all}

    echo "=================================================="
    echo "  Right-Click Context Menu Testing"
    echo "=================================================="
    echo ""

    # Check if server is running
    if ! check_server; then
        exit 1
    fi

    echo ""

    case $test_type in
        linear)
            echo "=== Linear Plan Test ==="
            echo "Tests: 2.1-2.7, 2.11-2.12 (Core functionality)"
            submit_plan "test-plan-linear.xml" "Linear Plan"
            ;;
        branch)
            echo "=== Branch Plan Test ==="
            echo "Tests: 2.8-2.9 (Branch restrictions)"
            submit_plan "test-plan-branches.xml" "Branch Plan"
            ;;
        convergence)
            echo "=== Convergence Plan Test ==="
            echo "Tests: 2.13 (Multiple incoming edges)"
            submit_plan "test-plan-convergence.xml" "Convergence Plan"
            ;;
        all)
            echo "=== Running All Tests ==="
            echo ""

            echo "Step 1: Linear Plan (Core Functionality)"
            echo "----------------------------------------"
            echo "Tests to perform:"
            echo "  - Right-click on nodes to open context menu"
            echo "  - Test Move Up/Down actions"
            echo "  - Test Delete Node action"
            echo "  - Test Insert Before/After actions"
            echo "  - Test Edit Details action"
            echo ""
            submit_plan "test-plan-linear.xml" "Linear Plan"
            echo ""
            wait_for_user

            echo ""
            echo "Step 2: Branch Plan (Restrictions)"
            echo "----------------------------------------"
            echo "Tests to perform:"
            echo "  - Right-click on branch point node (should be disabled)"
            echo "  - Right-click on possibility nodes (should be disabled)"
            echo "  - Verify context menu only works on linear nodes"
            echo ""
            submit_plan "test-plan-branches.xml" "Branch Plan"
            echo ""
            wait_for_user

            echo ""
            echo "Step 3: Convergence Plan (Edge Cases)"
            echo "----------------------------------------"
            echo "Tests to perform:"
            echo "  - Right-click on merge point (node C)"
            echo "  - Verify Delete/Insert Before/Move Up are disabled"
            echo "  - Test nodes with multiple incoming edges"
            echo ""
            submit_plan "test-plan-convergence.xml" "Convergence Plan"
            echo ""

            echo -e "${GREEN}=== All test plans submitted ===${NC}"
            echo ""
            echo "Manual Testing Checklist:"
            echo "-------------------------"
            echo "[ ] Test 2.1: Context Menu Opens"
            echo "[ ] Test 2.2: Move Up Action"
            echo "[ ] Test 2.3: Move Down Action"
            echo "[ ] Test 2.4: Delete Node Action"
            echo "[ ] Test 2.5: Insert After Action"
            echo "[ ] Test 2.6: Insert Before Action"
            echo "[ ] Test 2.7: Edit Details Action"
            echo "[ ] Test 2.8: Branch Point Restrictions"
            echo "[ ] Test 2.9: Possibility Node Restrictions"
            echo "[ ] Test 2.10: Plan Status Restrictions"
            echo "[ ] Test 2.11: First Node Move Up (Disabled)"
            echo "[ ] Test 2.12: Last Node Move Down (Disabled)"
            echo "[ ] Test 2.13: Multiple Incoming Edges (Delete Disabled)"
            echo ""
            echo "See full test report at:"
            echo "$MEMORY_DIR/TEST_REPORT_RIGHT_CLICK_CONTEXT_MENU.md"
            ;;
        *)
            echo -e "${RED}Invalid test type: $test_type${NC}"
            echo "Usage: $0 [linear|branch|convergence|all]"
            exit 1
            ;;
    esac

    echo ""
    echo "=================================================="
}

# Run main function
main "$@"
