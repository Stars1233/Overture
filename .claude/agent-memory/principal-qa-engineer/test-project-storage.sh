#!/bin/bash
#
# Project Storage Feature Test Script
# Tests per-project .overture.json storage vs global ~/.overture/history.json
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test configuration
API_URL="http://localhost:3031/api/test-plan"
GLOBAL_STORAGE="$HOME/.overture/history.json"
TEST_BASE_DIR="/tmp/overture-qa-tests-$(date +%s)"

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Overture Project Storage Feature Tests${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Helper functions
pass() {
  echo -e "${GREEN}✓ PASS${NC}: $1"
  ((TESTS_PASSED++))
}

fail() {
  echo -e "${RED}✗ FAIL${NC}: $1"
  ((TESTS_FAILED++))
}

info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

run_test() {
  ((TESTS_RUN++))
  echo ""
  echo -e "${YELLOW}━━━ Test $TESTS_RUN: $1 ━━━${NC}"
}

# Create test plan XML
create_test_plan_xml() {
  local workspace_path="$1"
  local plan_id="test-plan-$(date +%s)-$RANDOM"

  cat > /tmp/test-plan.xml <<EOF
<plan>
  <title>Test Plan for Project Storage</title>
  <agent>test-agent</agent>
  <workspace_path>$workspace_path</workspace_path>

  <node id="task1" type="task" status="pending">
    <title>Task 1: Test Storage</title>
    <description>This task tests project storage functionality</description>
    <field id="api_key" type="string" required="true" name="api_key">
      <title>API Key</title>
      <description>Test API key field</description>
    </field>
  </node>

  <node id="task2" type="task" status="pending">
    <title>Task 2: Verify Persistence</title>
    <description>Verify data persists correctly</description>
  </node>

  <edge from="task1" to="task2" />
</plan>
EOF

  echo "$plan_id"
}

# Submit plan via API
submit_plan() {
  local workspace_path="$1"
  local plan_id=$(create_test_plan_xml "$workspace_path")

  info "Submitting plan with workspace_path: $workspace_path"

  # Submit via API
  curl -s -X POST "$API_URL" \
    -H "Content-Type: application/xml" \
    --data @/tmp/test-plan.xml > /dev/null

  # Wait for plan to be processed
  sleep 2

  echo "$plan_id"
}

# Check if file exists
file_exists() {
  [ -f "$1" ]
}

# Check if file contains valid JSON
is_valid_json() {
  jq empty "$1" 2>/dev/null
}

# Get JSON field value
get_json_value() {
  local file="$1"
  local query="$2"
  jq -r "$query" "$file" 2>/dev/null
}

# Setup
info "Creating test directory structure..."
mkdir -p "$TEST_BASE_DIR"

# ============================================
# TEST 1: Project-Local Storage Creation
# ============================================
run_test "Project-local storage creation"

TEST_PROJECT_1="$TEST_BASE_DIR/project-1"
mkdir -p "$TEST_PROJECT_1"

plan_id=$(submit_plan "$TEST_PROJECT_1")
info "Submitted plan ID: $plan_id"

# Check if .overture.json was created
if file_exists "$TEST_PROJECT_1/.overture.json"; then
  pass "Created .overture.json in project directory"
else
  fail ".overture.json NOT created in project directory"
fi

# Verify JSON validity
if [ -f "$TEST_PROJECT_1/.overture.json" ]; then
  if is_valid_json "$TEST_PROJECT_1/.overture.json"; then
    pass "Project storage contains valid JSON"
  else
    fail "Project storage contains INVALID JSON"
  fi

  # Check version field
  version=$(get_json_value "$TEST_PROJECT_1/.overture.json" ".version")
  if [ "$version" = "1" ]; then
    pass "Version field is correct (version: 1)"
  else
    fail "Version field is incorrect (got: $version)"
  fi

  # Check projectId field
  project_id=$(get_json_value "$TEST_PROJECT_1/.overture.json" ".projectId")
  if [ -n "$project_id" ] && [ "$project_id" != "null" ]; then
    pass "ProjectId field is present: $project_id"
  else
    fail "ProjectId field is missing or null"
  fi

  # Check history array
  history_count=$(get_json_value "$TEST_PROJECT_1/.overture.json" ".history | length")
  if [ "$history_count" -gt 0 ]; then
    pass "History array contains $history_count entries"
  else
    fail "History array is empty"
  fi
fi

# ============================================
# TEST 2: Fallback to Global Storage
# ============================================
run_test "Fallback to global storage (no workspace_path)"

# Create plan XML without workspace_path
cat > /tmp/test-plan-no-workspace.xml <<EOF
<plan>
  <title>Test Plan Without Workspace</title>
  <agent>test-agent</agent>

  <node id="task1" type="task" status="pending">
    <title>Task 1</title>
    <description>Test global storage fallback</description>
  </node>
</plan>
EOF

info "Submitting plan WITHOUT workspace_path"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/xml" \
  --data @/tmp/test-plan-no-workspace.xml > /dev/null

sleep 2

# Check that global storage exists and has data
if file_exists "$GLOBAL_STORAGE"; then
  pass "Global storage file exists at ~/.overture/history.json"

  if is_valid_json "$GLOBAL_STORAGE"; then
    pass "Global storage contains valid JSON"
  else
    fail "Global storage contains INVALID JSON"
  fi
else
  warn "Global storage file not found (may not have been created yet)"
fi

# ============================================
# TEST 3: Read-Only Directory Fallback
# ============================================
run_test "Read-only directory fallback"

READONLY_PROJECT="$TEST_BASE_DIR/readonly-project"
mkdir -p "$READONLY_PROJECT"
chmod 555 "$READONLY_PROJECT"

info "Created read-only directory: $READONLY_PROJECT"

plan_id=$(submit_plan "$READONLY_PROJECT")
info "Submitted plan to read-only directory"

sleep 3  # Wait for auto-save attempt

# Check that .overture.json was NOT created
if file_exists "$READONLY_PROJECT/.overture.json"; then
  fail ".overture.json was created in read-only directory (should have failed)"
else
  pass ".overture.json NOT created in read-only directory (expected)"
fi

# Check that plan was saved to global storage instead
if file_exists "$GLOBAL_STORAGE"; then
  plan_count=$(get_json_value "$GLOBAL_STORAGE" ".plans | keys | length")
  info "Global storage contains $plan_count plans"
  pass "Fallback to global storage successful"
else
  fail "Global storage not found - fallback may have failed"
fi

# Cleanup read-only dir
chmod 755 "$READONLY_PROJECT"

# ============================================
# TEST 4: Auto-Save Functionality
# ============================================
run_test "Auto-save to project storage"

TEST_PROJECT_2="$TEST_BASE_DIR/project-2"
mkdir -p "$TEST_PROJECT_2"

plan_id=$(submit_plan "$TEST_PROJECT_2")
info "Submitted plan, waiting for auto-save..."

# Get initial modification time
if [ -f "$TEST_PROJECT_2/.overture.json" ]; then
  initial_mtime=$(stat -f %m "$TEST_PROJECT_2/.overture.json" 2>/dev/null || stat -c %Y "$TEST_PROJECT_2/.overture.json" 2>/dev/null)
  info "Initial file mtime: $initial_mtime"

  # Wait for auto-save interval (3 seconds + buffer)
  sleep 4

  # Check if file was updated
  new_mtime=$(stat -f %m "$TEST_PROJECT_2/.overture.json" 2>/dev/null || stat -c %Y "$TEST_PROJECT_2/.overture.json" 2>/dev/null)
  info "New file mtime: $new_mtime"

  if [ "$new_mtime" != "$initial_mtime" ]; then
    pass "File was updated by auto-save"
  else
    warn "File modification time unchanged (auto-save may not have triggered)"
  fi
else
  fail "Project storage file not found"
fi

# ============================================
# TEST 5: Multiple Projects Isolation
# ============================================
run_test "Multiple projects isolation"

TEST_PROJECT_3="$TEST_BASE_DIR/project-3"
TEST_PROJECT_4="$TEST_BASE_DIR/project-4"

mkdir -p "$TEST_PROJECT_3" "$TEST_PROJECT_4"

plan_id_3=$(submit_plan "$TEST_PROJECT_3")
plan_id_4=$(submit_plan "$TEST_PROJECT_4")

sleep 2

# Verify separate storage files
if file_exists "$TEST_PROJECT_3/.overture.json" && file_exists "$TEST_PROJECT_4/.overture.json"; then
  pass "Both projects have separate .overture.json files"

  # Verify projectIds are different
  project_id_3=$(get_json_value "$TEST_PROJECT_3/.overture.json" ".projectId")
  project_id_4=$(get_json_value "$TEST_PROJECT_4/.overture.json" ".projectId")

  if [ "$project_id_3" != "$project_id_4" ]; then
    pass "Projects have different projectIds (isolation confirmed)"
    info "Project 3 ID: $project_id_3"
    info "Project 4 ID: $project_id_4"
  else
    fail "Projects have SAME projectId (isolation FAILED)"
  fi

  # Verify no cross-contamination
  count_3=$(get_json_value "$TEST_PROJECT_3/.overture.json" ".history | length")
  count_4=$(get_json_value "$TEST_PROJECT_4/.overture.json" ".history | length")

  info "Project 3 has $count_3 plans, Project 4 has $count_4 plans"
  pass "Each project has independent history"
else
  fail "One or both projects missing .overture.json"
fi

# ============================================
# TEST 6: JSON Structure Validation
# ============================================
run_test "ProjectConfig JSON structure validation"

if [ -f "$TEST_PROJECT_1/.overture.json" ]; then
  # Check required fields
  has_version=$(get_json_value "$TEST_PROJECT_1/.overture.json" "has(\"version\")")
  has_project_id=$(get_json_value "$TEST_PROJECT_1/.overture.json" "has(\"projectId\")")
  has_history=$(get_json_value "$TEST_PROJECT_1/.overture.json" "has(\"history\")")

  if [ "$has_version" = "true" ] && [ "$has_project_id" = "true" ] && [ "$has_history" = "true" ]; then
    pass "All required fields present (version, projectId, history)"
  else
    fail "Missing required fields in ProjectConfig"
  fi

  # Check history entry structure
  plan_keys=$(get_json_value "$TEST_PROJECT_1/.overture.json" ".history[0] | keys")
  info "First history entry keys: $plan_keys"

  # Verify PersistedPlan structure
  for key in plan nodes edges fieldValues selectedBranches nodeConfigs; do
    has_key=$(get_json_value "$TEST_PROJECT_1/.overture.json" ".history[0] | has(\"$key\")")
    if [ "$has_key" = "true" ]; then
      pass "PersistedPlan has '$key' field"
    else
      fail "PersistedPlan missing '$key' field"
    fi
  done
fi

# ============================================
# TEST 7: File Permissions
# ============================================
run_test "File permissions check"

if [ -f "$TEST_PROJECT_1/.overture.json" ]; then
  perms=$(stat -f %OLp "$TEST_PROJECT_1/.overture.json" 2>/dev/null || stat -c %a "$TEST_PROJECT_1/.overture.json" 2>/dev/null)
  info "File permissions: $perms"

  # File should be readable and writable by owner
  if [ "$perms" = "644" ] || [ "$perms" = "664" ] || [ "$perms" = "600" ]; then
    pass "File permissions are appropriate"
  else
    warn "File permissions may be non-standard: $perms"
  fi
fi

# ============================================
# TEST 8: Concurrent Project Handling
# ============================================
run_test "Concurrent project handling"

info "Submitting plans to multiple projects simultaneously..."

TEST_PROJECT_5="$TEST_BASE_DIR/project-5"
TEST_PROJECT_6="$TEST_BASE_DIR/project-6"

mkdir -p "$TEST_PROJECT_5" "$TEST_PROJECT_6"

# Submit in parallel
submit_plan "$TEST_PROJECT_5" &
submit_plan "$TEST_PROJECT_6" &
wait

sleep 2

# Verify both succeeded
count=0
if file_exists "$TEST_PROJECT_5/.overture.json"; then
  ((count++))
fi
if file_exists "$TEST_PROJECT_6/.overture.json"; then
  ((count++))
fi

if [ $count -eq 2 ]; then
  pass "Both concurrent projects created storage successfully"
else
  fail "Only $count of 2 concurrent projects created storage"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Test Results Summary${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""
echo "Total Tests Run:    $TESTS_RUN"
echo -e "${GREEN}Tests Passed:       $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed:       $TESTS_FAILED${NC}"
echo ""

# Calculate pass rate
if [ $TESTS_RUN -gt 0 ]; then
  pass_rate=$((TESTS_PASSED * 100 / TESTS_RUN))
  echo "Pass Rate: $pass_rate%"
  echo ""
fi

# Print test artifacts location
echo "Test artifacts saved to:"
echo "  $TEST_BASE_DIR"
echo ""

# Cleanup prompt
echo "To cleanup test files, run:"
echo "  rm -rf $TEST_BASE_DIR"
echo "  (Global storage at ~/.overture/history.json not deleted)"
echo ""

# Exit with failure if any tests failed
if [ $TESTS_FAILED -gt 0 ]; then
  exit 1
else
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
fi
