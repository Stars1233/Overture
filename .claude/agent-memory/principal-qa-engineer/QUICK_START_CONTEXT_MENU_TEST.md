# Quick Start: Right-Click Context Menu Testing

**Feature:** Context menu on task nodes with Move/Delete/Insert/Edit actions
**Branch:** feature/right_click_options
**Status:** ✅ CODE REVIEW PASS - Ready for manual testing
**Time:** 90-120 minutes (full test suite)

---

## 1. Setup (5 minutes)

```bash
cd /Users/Opeyemi/Downloads/sixth-mcp/overture
npm run dev
```

**Verify:**
- UI loads at http://localhost:3031
- Browser console shows "WebSocket connected"
- No errors in console

---

## 2. Submit Test Plans (2 minutes)

```bash
# Navigate to test directory
cd /Users/Opeyemi/Downloads/sixth-mcp/overture/.claude/agent-memory/principal-qa-engineer

# Run automated test submission script
./test-context-menu.sh all

# OR submit manually
curl -X POST http://localhost:3031/api/test-plan \
  -H "Content-Type: application/xml" \
  -d @test-plan-linear.xml
```

---

## 3. Critical Tests (15 minutes minimum)

### Test 1: Menu Opens (2 min)
1. Right-click on Node B
2. **Expect:** Menu appears at cursor
3. **Verify:** 7 menu items visible, no console errors

### Test 2: Move Up (2 min)
1. Right-click on Node C
2. Click "Move Up"
3. **Expect:** Graph becomes A → C → B → D → E
4. **Verify:** Edges reconnected, no orphaned nodes

### Test 3: Delete Node (2 min)
1. Right-click on Node B
2. Click "Delete Node"
3. **Expect:** Node B removed, edge A → C created
4. **Verify:** Gap closed, plan totalCount decremented

### Test 4: Plan Status Restriction (2 min)
1. Approve plan (click Approve button)
2. Right-click on any node
3. **Expect:** Context menu DOES NOT APPEAR
4. **Critical:** If menu appears when status ≠ 'ready', this is a BLOCKER BUG

### Test 5: Branch Point Restriction (3 min)
1. Submit branch plan: `curl -X POST http://localhost:3031/api/test-plan -H "Content-Type: application/xml" -d @test-plan-branches.xml`
2. Right-click on "Branch Point" node (has 2 outgoing edges)
3. **Expect:** Context menu DOES NOT APPEAR
4. **Critical:** If menu appears on branch points, this is a BLOCKER BUG

### Test 6: Escape Key (1 min)
1. Right-click on node (menu opens)
2. Press Escape key
3. **Expect:** Menu closes
4. **Verify:** No errors in console

### Test 7: Viewport Positioning (3 min)
1. Pan canvas so node is near right edge of viewport
2. Right-click on that node
3. **Expect:** Menu shifts LEFT to stay visible
4. **Verify:** No horizontal scrollbar, menu fully visible

---

## 4. Pass/Fail Criteria

### MUST PASS (Blockers)
- [ ] Test 1: Menu Opens - PASS
- [ ] Test 2: Move Up - PASS
- [ ] Test 3: Delete Node - PASS
- [ ] Test 4: Plan Status Restriction - PASS
- [ ] Test 5: Branch Point Restriction - PASS

### SHOULD PASS (Quality)
- [ ] Test 6: Escape Key - PASS
- [ ] Test 7: Viewport Positioning - PASS

**If ANY MUST PASS test fails:** DO NOT MERGE, report bug immediately
**If SHOULD PASS tests fail:** Merge acceptable, file follow-up issues

---

## 5. Full Test Suite

For comprehensive testing, see:
- **Full Report:** `/Users/Opeyemi/Downloads/sixth-mcp/overture/.claude/agent-memory/principal-qa-engineer/TEST_REPORT_RIGHT_CLICK_CONTEXT_MENU.md`
- **25 Test Scenarios** across 4 priority levels
- **Test Plans:** test-plan-linear.xml, test-plan-branches.xml, test-plan-convergence.xml

---

## 6. Common Issues

### Menu doesn't appear
- **Check:** Plan status must be 'ready'
- **Check:** Node must not be a branch point
- **Check:** Node must not be a branch target
- **Check:** Console for JavaScript errors

### Actions are grayed out
- **Move Up disabled:** Node is first in plan (no predecessor)
- **Move Down disabled:** Node is last in plan (no successor)
- **Delete disabled:** Node has multiple incoming or outgoing edges
- **Expected behavior** - Not a bug

### Menu appears off-screen
- **Check:** Viewport positioning logic (lines 124-144 in ContextMenu.tsx)
- **Should auto-adjust** - If not adjusting, this is a bug

---

## 7. Report Results

Update checklist in:
`/Users/Opeyemi/Downloads/sixth-mcp/overture/.claude/agent-memory/principal-qa-engineer/TEST_REPORT_RIGHT_CLICK_CONTEXT_MENU.md`

### If All Tests Pass
- [ ] Update MEMORY.md with "Manual testing complete - PASS"
- [ ] Recommend merge to main branch
- [ ] File non-critical issues for future improvements (menu dimension measurement)

### If Tests Fail
- [ ] Document exact failure with screenshots
- [ ] Identify root cause (file, line number)
- [ ] Assess severity (blocker, critical, minor)
- [ ] DO NOT MERGE if blocker bugs found

---

## 8. Quick Reference

**Context Menu Features:**
- Move Up/Down: Swap node with adjacent node
- Delete Node: Remove node and reconnect edges
- Insert Before: Open modal to insert before current node
- Insert After: Open modal to insert after current node
- Edit Details: Open NodeDetailPanel for current node

**Restrictions:**
- Only works when plan.status === 'ready'
- Disabled on branch point nodes (multiple outgoing edges)
- Disabled on branch target nodes (has branchSourceId)
- Move Up disabled on first node
- Move Down disabled on last node
- Delete disabled on nodes with multiple connections

**Keyboard Shortcuts:**
- Escape: Close menu
- Right-click: Open menu (on nodes only)

---

**Generated:** 2026-03-04
**By:** Principal QA Engineer (Claude Agent)
**Confidence:** HIGH (comprehensive code review completed)
