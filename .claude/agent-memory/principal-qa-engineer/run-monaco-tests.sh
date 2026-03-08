#!/bin/bash
set -euo pipefail

# Monaco Editor Test Runner
# Submits test plan and provides instructions for manual verification

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly API_URL="http://localhost:3031/api/test-plan"
readonly TEST_PLAN="${SCRIPT_DIR}/monaco-test-data.xml"

echo "════════════════════════════════════════════════════════════════"
echo "  Monaco Editor Integration Test Runner"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check if server is running
echo "📡 Checking if Overture server is running..."
if ! curl -s -f "${API_URL}" > /dev/null 2>&1; then
  echo "❌ Overture server not responding at ${API_URL}"
  echo ""
  echo "Please start the server first:"
  echo "  cd /Users/Opeyemi/Downloads/sixth-mcp/overture"
  echo "  npm run dev"
  echo ""
  exit 1
fi

echo "✅ Server is running"
echo ""

# Submit test plan
echo "📤 Submitting Monaco test plan..."
if curl -X POST "${API_URL}" \
  -H "Content-Type: application/xml" \
  --data-binary "@${TEST_PLAN}" \
  -s -f > /dev/null 2>&1; then
  echo "✅ Test plan submitted successfully"
else
  echo "❌ Failed to submit test plan"
  exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Test Plan Submitted - Ready for Manual Testing"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Open browser: http://localhost:3031"
echo ""
echo "📋 Manual Testing Steps:"
echo ""
echo "  1. Verify plan canvas shows all test nodes"
echo "  2. For each node, execute and verify Monaco Editor:"
echo ""
echo "     SYNTAX HIGHLIGHTING TESTS:"
echo "     ├─ typescript-file    → TypeScript syntax (blue keywords, green strings)"
echo "     ├─ javascript-file    → JavaScript syntax"
echo "     ├─ python-file        → Python syntax (def, class highlighted)"
echo "     ├─ json-file          → JSON syntax (colored keys/values)"
echo "     ├─ css-file           → CSS syntax (selectors, properties)"
echo "     ├─ html-file          → HTML syntax (tags, attributes)"
echo "     ├─ markdown-file      → Markdown syntax (headers, code blocks)"
echo "     ├─ dockerfile-test    → Dockerfile syntax"
echo "     ├─ yaml-file          → YAML syntax"
echo "     └─ shell-file         → Shell script syntax"
echo ""
echo "     EDITOR FEATURE TESTS:"
echo "     ├─ large-diff         → 300+ lines, scrollbar, max height 300px"
echo "     ├─ small-diff         → 3 lines, min height 80px, no scroll"
echo "     ├─ edge-case-diff     → Diff normalization (removes blank lines)"
echo "     └─ combined-output    → All output types together"
echo ""
echo "     UI INTERACTION TESTS:"
echo "     ├─ create-files       → FileCreatedItem display (no Monaco)"
echo "     └─ delete-files       → Files deleted list"
echo ""
echo "  3. For each file change:"
echo "     ☑ Click to expand → smooth animation (200ms)"
echo "     ☑ Monaco editor loads with syntax highlighting"
echo "     ☑ Line numbers visible"
echo "     ☑ Dark theme (#18181b background)"
echo "     ☑ Copy button works → clipboard test"
echo "     ☑ Click to collapse → smooth animation"
echo ""
echo "  4. Performance checks:"
echo "     ☑ Open DevTools → Console tab (no errors)"
echo "     ☑ Performance tab → Memory stable"
echo "     ☑ Expand/collapse 20 times → no lag"
echo ""
echo "  5. Theme verification:"
echo "     ☑ Inspect editor background → #18181b"
echo "     ☑ Line numbers → #71717a (muted)"
echo "     ☑ Selection highlight → #3b82f640 (blue with opacity)"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Reference Documentation"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📄 Test Protocol:  ${SCRIPT_DIR}/MONACO_TEST_PROTOCOL.md"
echo "📄 Test Outputs:   ${SCRIPT_DIR}/monaco-test-outputs.md"
echo "📄 Test Plan XML:  ${TEST_PLAN}"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "To execute individual nodes, use the structured outputs from:"
echo "  ${SCRIPT_DIR}/monaco-test-outputs.md"
echo ""
echo "Copy each <execution_output> block and submit via MCP tool:"
echo "  update_node_status(node_id, status='completed', output=...)"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  Happy Testing! 🧪"
echo "════════════════════════════════════════════════════════════════"
