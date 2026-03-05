# Testing Instructions: update_node_detail MCP Tool

**Feature:** New MCP tool for updating individual node details
**Status:** ✅ Code Review PASSED - Ready for Manual Testing
**Date:** 2026-03-04

---

## Quick Start

### 1. Start the Server
```bash
cd /Users/Opeyemi/Downloads/sixth-mcp/overture
npm run dev
```

**Verify:**
- ✅ MCP Server: http://localhost:3031
- ✅ WebSocket: ws://localhost:3030
- ✅ UI loads without errors

### 2. Submit Test Plan

Create a file `test-plan.xml`:
```xml
<?xml version="1.0"?>
<plan id="test_update" title="Node Update Test" agent="tester">
  <node id="test_update:node_1" type="task" title="Original Title">
    <description>Original description</description>
    <complexity>medium</complexity>
    <expectedOutput>Original output</expectedOutput>
    <risks>Original risks</risks>
  </node>
  <node id="test_update:node_2" type="task" title="Second Node">
    <description>Second node description</description>
  </node>
  <edge from="test_update:node_1" to="test_update:node_2" />
</plan>
```

Submit via API:
```bash
curl -X POST http://localhost:3031/api/test-plan \
  -H "Content-Type: application/json" \
  -d '{
    "planXml": "'"$(cat test-plan.xml)"'",
    "workspacePath": "/tmp/test",
    "agentType": "test"
  }'
```

### 3. Test the Tool

**Test Case 1: Update Title**
```javascript
// Via MCP Inspector or SDK Client
{
  "tool": "update_node_detail",
  "arguments": {
    "node_id": "test_update:node_1",
    "updates": {
      "title": "Updated Title!"
    }
  }
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Node test_update:node_1 updated successfully",
  "node": {
    "id": "test_update:node_1",
    "title": "Updated Title!",
    "description": "Original description",
    "complexity": "medium"
  }
}
```

**Verify in UI:**
1. Open http://localhost:3031
2. Node title should update immediately (no refresh)
3. Click node → NodeDetailPanel shows "Updated Title!"
4. Check DevTools Console for WebSocket message

---

## Complete Test Suite

### Test 1: Single Field Update ✅
**Update only title:**
```json
{
  "node_id": "test_update:node_1",
  "updates": { "title": "New Title" }
}
```
**Verify:** Only title changed, other fields unchanged

### Test 2: Multiple Fields ✅
**Update title + description + complexity:**
```json
{
  "node_id": "test_update:node_1",
  "updates": {
    "title": "Multi Update",
    "description": "New description",
    "complexity": "high"
  }
}
```
**Verify:** All 3 fields updated, expectedOutput/risks unchanged

### Test 3: Complexity Values ✅
**Test each complexity level:**
```json
// Low
{ "node_id": "test_update:node_1", "updates": { "complexity": "low" } }

// Medium
{ "node_id": "test_update:node_1", "updates": { "complexity": "medium" } }

// High
{ "node_id": "test_update:node_1", "updates": { "complexity": "high" } }
```
**Verify:** Badge color changes in UI for each level

### Test 4: Invalid Node ID ❌
**Test error handling:**
```json
{
  "node_id": "invalid:node_999",
  "updates": { "title": "Should Fail" }
}
```
**Expected:** `success: false`, error message includes "not found"

### Test 5: Expected Output ✅
**Test multiline output:**
```json
{
  "node_id": "test_update:node_1",
  "updates": {
    "expectedOutput": "Files created:\n- src/Widget.tsx\n- tests/Widget.test.tsx"
  }
}
```
**Verify:** Multiline formatting preserved in NodeDetailPanel

### Test 6: Risks Field ✅
**Test risks with emojis:**
```json
{
  "node_id": "test_update:node_1",
  "updates": {
    "risks": "⚠️ Breaking change\n⚠️ Database migration required"
  }
}
```
**Verify:** Emojis render correctly in UI

### Test 7: Empty Updates ✅
**Test no-op:**
```json
{
  "node_id": "test_update:node_1",
  "updates": {}
}
```
**Expected:** Success, no changes, no WebSocket broadcast

### Test 8: WebSocket Real-time ✅
**Verify real-time updates:**
1. Open DevTools → Network → WS tab
2. Execute any update
3. **Verify WebSocket message:**
   ```json
   {
     "type": "node_detail_updated",
     "nodeId": "test_update:node_1",
     "updates": { "title": "..." },
     "projectId": "..."
   }
   ```
4. **Verify UI updates without refresh**

---

## Regression Tests

Run these to ensure existing features still work:

### Regression 1: Plan Submission
```bash
curl -X POST http://localhost:3031/api/test-plan \
  -H "Content-Type: application/json" \
  -d @another-plan.json
```
**Verify:** Nodes render on canvas, edges connect correctly

### Regression 2: Node Status Updates
**Use existing update_node_status tool:**
```json
{
  "tool": "update_node_status",
  "arguments": {
    "node_id": "test_update:node_1",
    "status": "active"
  }
}
```
**Verify:** Status badge updates, no interference with node details

### Regression 3: Node Detail Panel
**Click different nodes:**
1. Click node_1 → verify all fields display
2. Click node_2 → verify panel switches
3. **Verify:** No stale data, panel updates correctly

### Regression 4: Approval Flow
1. Submit plan
2. Fill dynamic fields (if any)
3. Click "Approve Plan"
4. **Verify:** Approval works normally

---

## WebSocket Message Verification

**Expected Message Format:**
```json
{
  "type": "node_detail_updated",
  "nodeId": "test_update:node_1",
  "updates": {
    "title": "Updated Title"
  },
  "projectId": "abc123456789"
}
```

**What to Check:**
- ✅ Message type is exactly `"node_detail_updated"`
- ✅ `nodeId` matches the updated node
- ✅ `updates` contains ONLY changed fields
- ✅ `projectId` is present
- ✅ Message appears immediately after tool call

---

## Using MCP Inspector

### Install
```bash
npm install -g @modelcontextprotocol/inspector
```

### Connect to Overture
```bash
# From overture/packages/mcp-server directory
mcp-inspector connect stdio node dist/index.js
```

### Execute Tools
1. Open Inspector UI (usually http://localhost:5173)
2. Find `update_node_detail` in tool list
3. Fill in arguments
4. Click "Execute"
5. View response

---

## Expected Behavior Summary

### What SHOULD Happen ✅
- ✅ UI updates immediately (no refresh)
- ✅ WebSocket message broadcasts
- ✅ NodeDetailPanel shows changes
- ✅ Only specified fields update
- ✅ Unchanged fields remain intact
- ✅ Complexity badge renders correctly
- ✅ Multi-line text preserves formatting
- ✅ Invalid node returns clear error

### What should NOT Happen ❌
- ❌ Page refresh required
- ❌ All fields reset to defaults
- ❌ Wrong node gets updated
- ❌ WebSocket message missing
- ❌ Console errors
- ❌ UI becomes unresponsive
- ❌ Data loss on other nodes
- ❌ Cross-project contamination

---

## Troubleshooting

### Issue: "Node not found" error
**Cause:** Node ID incorrect or plan not loaded
**Fix:** Check plan was submitted, verify node ID format: `plan_id:node_id`

### Issue: UI doesn't update
**Cause:** WebSocket connection lost
**Fix:**
1. Check DevTools → Network → WS tab
2. Verify connection is "Connected"
3. Refresh page if disconnected

### Issue: Tool not found
**Cause:** MCP server not running or outdated build
**Fix:**
```bash
cd packages/mcp-server
npm run build
npm run start
```

### Issue: Complexity validation fails
**Cause:** Invalid complexity value
**Fix:** Use only: `"low"`, `"medium"`, `"high"`

---

## Success Checklist

Mark each test as you complete it:

**Functional Tests:**
- [ ] Test 1: Single field update
- [ ] Test 2: Multiple fields
- [ ] Test 3: All complexity values
- [ ] Test 4: Invalid node ID
- [ ] Test 5: Expected output
- [ ] Test 6: Risks field
- [ ] Test 7: Empty updates
- [ ] Test 8: WebSocket real-time

**Regression Tests:**
- [ ] Plan submission
- [ ] Node status updates
- [ ] Node detail panel
- [ ] Approval flow

**UI Verification:**
- [ ] Immediate UI updates
- [ ] NodeDetailPanel accuracy
- [ ] Complexity badge rendering
- [ ] Multi-line formatting
- [ ] No console errors

**WebSocket Verification:**
- [ ] Message format correct
- [ ] ProjectId included
- [ ] Only changed fields sent
- [ ] Message timing correct

---

## Next Steps After Testing

1. **If All Tests Pass:**
   - Update test report with PASS status
   - Take screenshots for documentation
   - Approve PR for merge

2. **If Any Test Fails:**
   - Document failure in test report
   - Create bug report with reproduction steps
   - Block PR until fixed

3. **Performance Testing (Optional):**
   - Test with 100+ node plan
   - Test rapid sequential updates
   - Measure WebSocket latency

---

## Additional Resources

**Test Reports:**
- Comprehensive: `.claude/agent-memory/principal-qa-engineer/update_node_detail_test_report.md`
- Summary: `.claude/agent-memory/principal-qa-engineer/TEST_SUMMARY_update_node_detail.md`

**Test Scripts:**
- Automated demo: `/test-update-node-detail.js`

**Agent Memory:**
- Testing patterns: `.claude/agent-memory/principal-qa-engineer/MEMORY.md`

---

**Questions?** Check the comprehensive test report or agent memory files above.

**Ready to Test?** Follow Quick Start steps at the top of this document.

**Good luck testing! 🎯**
