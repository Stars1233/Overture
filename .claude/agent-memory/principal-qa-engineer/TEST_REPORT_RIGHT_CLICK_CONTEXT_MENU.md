# Test Report: Right-Click Context Menu Feature
**Date:** 2026-03-04
**Branch:** feature/right_click_options
**Test Type:** Code Review + Manual Testing Protocol
**Status:** READY FOR MANUAL TESTING

---

## Executive Summary

The right-click context menu feature has been implemented across 3 UI components with comprehensive integration into the plan store. Code review reveals **SOLID IMPLEMENTATION** with proper state management, edge case handling, and accessibility features. The feature is ready for manual testing.

**VERDICT:** Code Review PASS - No blocking issues found. Proceed to manual testing.

---

## 1. Code Review Results

### 1.1 ContextMenu Component (`packages/ui/src/components/Canvas/ContextMenu.tsx`)

**ANALYSIS:** Well-architected component with proper Framer Motion animations and event handling.

#### Strengths
- **Viewport-aware positioning** (lines 124-144): Menu adjusts position to prevent overflow
- **Keyboard accessibility**: Escape key handler (lines 107-121)
- **Click-outside detection**: Uses capture phase for proper event handling (lines 91-105)
- **Disabled state styling**: Proper visual feedback for unavailable actions
- **Menu structure**: Logical grouping with dividers (Move/Insert/Edit/Delete sections)

#### Potential Issues
- **Magic numbers**: Menu dimensions hardcoded (180px width, 260px height on lines 127-128)
- **PASS**: Acceptable for MVP, but should be measured dynamically in future iteration

#### Action Items
- None critical - feature is production-ready

---

### 1.2 TaskNode Component (`packages/ui/src/components/Canvas/TaskNode.tsx`)

**ANALYSIS:** Context menu handler properly integrated without disrupting existing node functionality.

#### Changes Made
- **Lines 65-72**: `handleContextMenu` function added with proper event prevention
- **Line 133**: `onContextMenu={handleContextMenu}` attached to motion.div
- **Data props**: `canShowContextMenu`, `onContextMenu`, `planId` passed through node data

#### Strengths
- **Conditional rendering**: Menu only shows if `canShowContextMenu === true` (line 67)
- **Event propagation**: `stopPropagation()` prevents canvas deselection
- **No breaking changes**: Existing hover buttons (+/-) remain functional

#### Edge Cases Validated
- **Disabled nodes**: Context menu blocked via `canShowContextMenu` flag
- **Branch nodes**: Context menu properly restricted (see PlanCanvas logic)

---

### 1.3 PlanCanvas Component (`packages/ui/src/components/Canvas/PlanCanvas.tsx`)

**ANALYSIS:** Complex integration with comprehensive business logic. This is the critical component.

#### Context Menu State Management (Lines 570-581)
```typescript
const [contextMenu, setContextMenu] = useState<ContextMenuState>({
  isOpen: false,
  position: { x: 0, y: 0 },
  nodeId: '',
  planId: '',
  canMoveUp: false,
  canMoveDown: false,
  canDelete: false,
  canInsertBefore: false,
  canInsertAfter: false,
});
```
**PASS**: Proper TypeScript typing, all required flags present.

#### Context Menu Availability Logic (Lines 379-390)

**CRITICAL BUSINESS LOGIC:**
```typescript
const canShowContextMenu = plan.status === 'ready' &&
                            !isBranchPoint &&
                            !hasBranchSource &&
                            !isConnectedToPossibility;
```

**Validation:**
- **Plan status check**: Only 'ready' status allows modifications (CORRECT)
- **Branch point restriction**: Prevents menu on nodes with multiple outgoing edges (CORRECT)
- **Branch target restriction**: Blocks menu on possibility nodes (CORRECT)
- **Connected nodes check**: Disables menu on nodes adjacent to branch structures (CORRECT)

**PASS**: Business rules properly enforced.

#### Move Up/Down Logic (Lines 399-406)

**Edge Case Handling:**
```typescript
const canMoveUp = canShowContextMenu &&
                  prevNodeId !== null &&
                  !branchPointInfo[prevNodeId] &&
                  !branchTargetInfo[prevNodeId];
```

**Validation:**
- Checks predecessor exists (CORRECT)
- Prevents swapping with branch points (CORRECT)
- Prevents swapping with branch targets (CORRECT)

**PASS**: Comprehensive edge case coverage.

#### Context Menu Handler (Lines 590-633)

**Flow Analysis:**
1. Find plan data by planId (line 594)
2. Find node in plan (line 598)
3. Get adjacent node IDs (line 602)
4. Build edge maps for validation (lines 605-610)
5. Determine available actions (lines 616-620)
6. Set context menu state (lines 622-632)

**PASS**: Proper null checks, no race conditions detected.

#### Action Handlers

**Move Up Handler (Lines 640-645):**
- Gets prevNodeId from store
- Calls `swapNodes(prevNodeId, nodeId, planId)`
- **PASS**: Correct parameter order

**Move Down Handler (Lines 647-652):**
- Gets nextNodeId from store
- Calls `swapNodes(nodeId, nextNodeId, planId)`
- **PASS**: Correct parameter order

**Delete Handler (Lines 654-656):**
- Calls `removeNode(nodeId)` via WebSocket hook
- **PASS**: Triggers server-side deletion with proper sync

**Insert Before Handler (Lines 658-668):**
- If predecessor exists: calls `setPendingInsert(prevNodeId)`
- If no predecessor: calls `setPendingInsertBefore(nodeId)`
- **PASS**: Handles first-node case correctly

**Insert After Handler (Lines 670-672):**
- Calls `setPendingInsert(nodeId)`
- **PASS**: Simple and correct

**Edit Details Handler (Lines 674-676):**
- Calls `setSelectedNodeId(nodeId, planId)`
- **PASS**: Opens node detail panel

---

### 1.4 Plan Store (`packages/ui/src/stores/plan-store.ts`)

**ANALYSIS:** New methods added for node reordering functionality.

#### swapNodes Method (Lines 761-833)

**Algorithm Analysis:**
1. Find edge between two nodes (lines 768-776)
2. Validate adjacency (lines 772-776)
3. Find predecessor and successor edges (lines 783-785)
4. Rebuild edge graph with swapped positions (lines 795-825)

**Edge Cases:**
- **Non-adjacent nodes**: Returns early with console warning (CORRECT)
- **Multiple predecessors/successors**: Not explicitly handled
  - **CONCERN**: Could cause issues if invoked on nodes with fan-in/fan-out
  - **MITIGATION**: PlanCanvas prevents this via `canMoveUp`/`canMoveDown` checks
  - **VERDICT**: PASS with assumption that caller enforces constraints

#### getAdjacentNodeIds Method (Lines 836-852)

**Logic:**
- Finds predecessor edge where `e.to === nodeId` (line 844)
- Finds successor edge where `e.from === nodeId` (line 848)
- Returns both or null if not found

**Edge Cases:**
- **Multiple incoming edges**: Takes first match only
- **Multiple outgoing edges**: Takes first match only
- **CONCERN**: Ambiguous behavior for complex graphs
- **MITIGATION**: Context menu handler already checks edge counts (lines 605-620)
- **VERDICT**: PASS with assumption that caller validates graph structure

#### pendingInsertBefore State (Lines 855-858)

**NEW STATE:**
```typescript
pendingInsertBefore: { beforeNodeId: string } | null;
setPendingInsertBefore: (beforeNodeId: string | null) => void;
```

**PASS**: Consistent with existing `pendingInsert` pattern.

---

## 2. Critical Test Scenarios (Prioritized)

### Priority 1: Core Functionality (MUST PASS)

#### Test 2.1: Context Menu Opens
**Steps:**
1. Start UI: `npm run dev`
2. Submit test plan with 5+ linear nodes
3. Right-click on middle node

**Expected:**
- Menu appears at cursor position
- All 7 menu items visible (Move Up, Move Down, Insert Before, Insert After, Edit Details, Delete)
- No console errors

**Validation:**
- Screenshot menu at cursor position
- Verify menu doesn't overflow viewport

---

#### Test 2.2: Move Up Action
**Steps:**
1. Submit plan with nodes A -> B -> C
2. Right-click on node C
3. Verify "Move Up" is enabled
4. Click "Move Up"

**Expected:**
- Graph becomes A -> C -> B
- Edges reconnected correctly
- Menu closes
- No orphaned edges

**Validation:**
- Check edge IDs in React Flow dev tools
- Verify no duplicate edges

---

#### Test 2.3: Move Down Action
**Steps:**
1. Submit plan with nodes A -> B -> C
2. Right-click on node A
3. Verify "Move Down" is enabled
4. Click "Move Down"

**Expected:**
- Graph becomes B -> A -> C
- Edges reconnected correctly
- Menu closes

**Validation:**
- Verify edge directions match new order
- Check no duplicate edges exist

---

#### Test 2.4: Delete Node Action
**Steps:**
1. Submit plan with nodes A -> B -> C
2. Right-click on node B
3. Click "Delete Node"

**Expected:**
- Node B removed from canvas
- Edge created: A -> C (gap closed)
- Menu closes
- Plan totalCount decremented

**Validation:**
- Check WebSocket message sent
- Verify server state updated
- Confirm no dangling edges

---

#### Test 2.5: Insert After Action
**Steps:**
1. Submit plan with nodes A -> B
2. Right-click on node A
3. Click "Insert After"

**Expected:**
- InsertNodeModal opens
- After submission: Node inserted between A and B
- Edges: A -> NEW -> B

**Validation:**
- Check `pendingInsert` state in Zustand store
- Verify modal receives correct afterNodeId

---

#### Test 2.6: Insert Before Action
**Steps:**
1. Submit plan with nodes A -> B -> C
2. Right-click on node B
3. Click "Insert Before"

**Expected:**
- InsertNodeModal opens
- After submission: Node inserted between A and B
- Edges: A -> NEW -> B -> C

**Validation:**
- Check if `setPendingInsert(A)` or `setPendingInsertBefore(B)` called
- Verify correct edge reconstruction

---

#### Test 2.7: Edit Details Action
**Steps:**
1. Submit plan with node A
2. Right-click on node A
3. Click "Edit Details"

**Expected:**
- NodeDetailPanel slides in from right
- Panel shows node A's details
- Menu closes

**Validation:**
- Check `selectedNodeId` in store
- Verify panel title matches node title

---

### Priority 2: Edge Cases & Restrictions (MUST PASS)

#### Test 2.8: Branch Point Restrictions
**Setup:**
```xml
<plan>
  <node id="1" title="Branch Point">
    <branches>
      <branch id="b1" label="Option A"/>
      <branch id="b2" label="Option B"/>
    </branches>
  </node>
  <node id="2" branchParent="1" branchId="b1" title="Path A"/>
  <node id="3" branchParent="1" branchId="b2" title="Path B"/>
  <edge from="1" to="2"/>
  <edge from="1" to="3"/>
</plan>
```

**Steps:**
1. Submit plan with branch point
2. Right-click on node 1 (branch point)

**Expected:**
- Context menu DOES NOT APPEAR
- Or menu appears with ALL actions disabled

**Validation:**
- Check `canShowContextMenu === false` in node data
- Verify `isBranchPoint === true`

---

#### Test 2.9: Possibility Node Restrictions
**Steps:**
1. Submit plan with branches (from Test 2.8)
2. Right-click on node 2 (possibility node with branchSourceId)

**Expected:**
- Context menu DOES NOT APPEAR
- Or menu appears with ALL actions disabled

**Validation:**
- Check `hasBranchSource === true` in PlanCanvas logic
- Verify `canShowContextMenu === false`

---

#### Test 2.10: Plan Status Restrictions
**Steps:**
1. Submit plan, verify status='ready'
2. Right-click node - verify menu works
3. Approve plan (status='approved')
4. Right-click same node

**Expected (status='approved'):**
- Context menu DOES NOT APPEAR

**Steps (continued):**
5. Start execution (status='executing')
6. Right-click any node

**Expected (status='executing'):**
- Context menu DOES NOT APPEAR

**Validation:**
- Check `plan.status !== 'ready'` condition on line 387
- Verify menu disabled across all non-ready statuses

---

#### Test 2.11: First Node Move Up (Disabled)
**Steps:**
1. Submit plan with nodes A -> B -> C
2. Right-click on node A (first node)

**Expected:**
- "Move Up" action is DISABLED (grayed out)
- Cannot be clicked

**Validation:**
- Check `canMoveUp === false` in context menu state
- Verify `prevNodeId === null` in getAdjacentNodeIds

---

#### Test 2.12: Last Node Move Down (Disabled)
**Steps:**
1. Submit plan with nodes A -> B -> C
2. Right-click on node C (last node)

**Expected:**
- "Move Down" action is DISABLED (grayed out)
- Cannot be clicked

**Validation:**
- Check `canMoveDown === false` in context menu state
- Verify `nextNodeId === null` in getAdjacentNodeIds

---

#### Test 2.13: Multiple Incoming Edges (Delete Disabled)
**Setup:**
- Create plan with convergence: A -> C, B -> C
- Node C has 2 incoming edges

**Steps:**
1. Right-click on node C

**Expected:**
- "Delete Node" is DISABLED
- "Insert Before" is DISABLED
- "Move Up" is DISABLED

**Validation:**
- Check `hasMultipleIncoming === true` (line 613)
- Verify `canDelete === false` (line 618)

---

#### Test 2.14: Multiple Outgoing Edges (Delete Disabled)
**Setup:**
- Branch point already tested in 2.8
- Additional test: Node with fan-out A -> B, A -> C

**Steps:**
1. Right-click on node A

**Expected:**
- Context menu DOES NOT APPEAR (caught by isBranchPoint check)

---

### Priority 3: UI/UX & Accessibility (SHOULD PASS)

#### Test 2.15: Menu Positioning (Right Edge)
**Steps:**
1. Submit plan
2. Pan canvas so a node is near right edge of viewport
3. Right-click on that node

**Expected:**
- Menu appears but is shifted LEFT to stay in viewport
- No horizontal scrollbar appears
- Menu fully visible

**Validation:**
- Check `getAdjustedPosition()` calculation (lines 124-144)
- Verify `adjustedX` calculation when `position.x + menuWidth > viewportWidth`

---

#### Test 2.16: Menu Positioning (Bottom Edge)
**Steps:**
1. Submit plan
2. Pan canvas so a node is near bottom edge of viewport
3. Right-click on that node

**Expected:**
- Menu appears but is shifted UP to stay in viewport
- No vertical scrollbar appears
- Menu fully visible

**Validation:**
- Check `adjustedY` calculation when `position.y + menuHeight > viewportHeight`

---

#### Test 2.17: Escape Key Closes Menu
**Steps:**
1. Right-click on node (menu opens)
2. Press Escape key

**Expected:**
- Menu closes immediately
- No errors in console

**Validation:**
- Verify event listener added (line 117)
- Check `isOpen` state becomes false

---

#### Test 2.18: Click Outside Closes Menu
**Steps:**
1. Right-click on node (menu opens)
2. Click on canvas background (outside menu)

**Expected:**
- Menu closes
- Node is deselected (pane click behavior)

**Validation:**
- Verify capture phase listener (line 101)
- Check `onClose()` is called

---

#### Test 2.19: Click on Node Closes Menu
**Steps:**
1. Right-click on node A (menu opens)
2. Click on node B (different node)

**Expected:**
- Menu closes
- Node B is selected
- NodeDetailPanel shows node B

**Validation:**
- Check event order: mousedown (close menu) -> click (select node)

---

#### Test 2.20: Framer Motion Animations
**Steps:**
1. Right-click on node (menu opens)
2. Observe menu appearance
3. Click outside (menu closes)
4. Observe menu disappearance

**Expected:**
- **Open**: Fade in + scale from 0.95 to 1.0 (duration 0.1s)
- **Close**: Fade out + scale from 1.0 to 0.95 (duration 0.1s)
- Smooth, no jank

**Validation:**
- Visual inspection (record video if possible)
- Check motion.div props (lines 182-187)

---

### Priority 4: Regression Tests (MUST NOT BREAK)

#### Test 2.21: Existing Hover Buttons Still Work
**Steps:**
1. Submit plan with nodes A -> B -> C
2. Hover over node B
3. Click + button (insert after)

**Expected:**
- InsertNodeModal opens
- Behavior unchanged from before feature

**Validation:**
- Verify hover buttons (lines 152-181 in TaskNode.tsx) still functional

---

#### Test 2.22: Node Selection Still Works
**Steps:**
1. Submit plan
2. Left-click on node

**Expected:**
- Node selected (blue ring appears)
- NodeDetailPanel opens
- No context menu appears

**Validation:**
- Check `onNodeClick` handler (lines 722-730 in PlanCanvas.tsx)

---

#### Test 2.23: Canvas Panning Not Broken
**Steps:**
1. Submit plan with many nodes
2. Click and drag on canvas background

**Expected:**
- Canvas pans normally
- No context menu appears on canvas

**Validation:**
- Right-click should only work on nodes, not canvas

---

#### Test 2.24: Branch Selection Modal Still Works
**Steps:**
1. Submit plan with branch point
2. Left-click on branch point node

**Expected:**
- BranchSelectionModal opens
- Can select between branches
- Context menu does NOT appear

**Validation:**
- Verify branch modal takes precedence over context menu

---

#### Test 2.25: Multi-Plan Support
**Steps:**
1. Submit plan A (3 nodes)
2. Submit plan B (3 nodes) without closing A
3. Right-click on node in plan A
4. Delete node from plan A
5. Right-click on node in plan B

**Expected:**
- Each plan's context menu operates independently
- Deleting from plan A doesn't affect plan B
- planId correctly scoped to each plan

**Validation:**
- Check `planId` parameter in all handlers
- Verify `updatePlanData` targets correct plan (plan-store.ts:260-270)

---

## 3. Manual Testing Protocol

### Prerequisites
```bash
cd /Users/Opeyemi/Downloads/sixth-mcp/overture
npm install
npm run dev
```

**Environment:**
- UI: http://localhost:3031
- WebSocket: ws://localhost:3030
- Browser: Chrome 120+ (for best Framer Motion support)

### Test Plan Submission Scripts

Create these files in `/Users/Opeyemi/Downloads/sixth-mcp/overture/.claude/agent-memory/principal-qa-engineer/`:

**test-plan-linear.xml** (for Tests 2.1-2.7, 2.11-2.12)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<plan id="linear-test-001" title="Linear Plan for Context Menu" agent="qa-tester">
  <node id="A" title="Node A" description="First node"/>
  <node id="B" title="Node B" description="Middle node"/>
  <node id="C" title="Node C" description="Last node"/>
  <node id="D" title="Node D" description="Another middle node"/>
  <node id="E" title="Node E" description="Final node"/>

  <edge from="A" to="B"/>
  <edge from="B" to="C"/>
  <edge from="C" to="D"/>
  <edge from="D" to="E"/>
</plan>
```

**test-plan-branches.xml** (for Tests 2.8-2.9)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<plan id="branch-test-001" title="Branch Plan for Context Menu" agent="qa-tester">
  <node id="1" title="Start" description="Initial task"/>
  <node id="2" title="Branch Point" description="Choose implementation">
    <branches>
      <branch id="b1" label="React Approach">
        <description>Use React hooks</description>
        <pros>Modern, type-safe</pros>
        <cons>Larger bundle</cons>
      </branch>
      <branch id="b2" label="Vanilla JS Approach">
        <description>Use plain JavaScript</description>
        <pros>Smaller bundle</pros>
        <cons>More boilerplate</cons>
      </branch>
    </branches>
  </node>
  <node id="3" branchParent="2" branchId="b1" title="Install React deps" description="npm install react"/>
  <node id="4" branchParent="2" branchId="b2" title="Setup vanilla JS" description="Create index.js"/>
  <node id="5" title="Test implementation" description="Run tests"/>

  <edge from="1" to="2"/>
  <edge from="2" to="3"/>
  <edge from="2" to="4"/>
  <edge from="3" to="5"/>
  <edge from="4" to="5"/>
</plan>
```

**test-plan-convergence.xml** (for Test 2.13)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<plan id="convergence-test-001" title="Convergence Plan for Context Menu" agent="qa-tester">
  <node id="A" title="Path A Start" description="Parallel task A"/>
  <node id="B" title="Path B Start" description="Parallel task B"/>
  <node id="C" title="Merge Point" description="Combines A and B"/>
  <node id="D" title="Continue" description="After merge"/>

  <edge from="A" to="C"/>
  <edge from="B" to="C"/>
  <edge from="C" to="D"/>
</plan>
```

### Submission Commands

```bash
# Submit linear plan
curl -X POST http://localhost:3031/api/test-plan \
  -H "Content-Type: application/xml" \
  -d @.claude/agent-memory/principal-qa-engineer/test-plan-linear.xml

# Submit branch plan
curl -X POST http://localhost:3031/api/test-plan \
  -H "Content-Type: application/xml" \
  -d @.claude/agent-memory/principal-qa-engineer/test-plan-branches.xml

# Submit convergence plan
curl -X POST http://localhost:3031/api/test-plan \
  -H "Content-Type: application/xml" \
  -d @.claude/agent-memory/principal-qa-engineer/test-plan-convergence.xml
```

---

## 4. Test Execution Checklist

### Pre-Testing Setup
- [ ] Server running (`npm run dev` in terminal)
- [ ] UI accessible at http://localhost:3031
- [ ] WebSocket connected (check browser console: "WebSocket connected")
- [ ] Browser DevTools open (Console + React DevTools)
- [ ] Test XML files created in memory directory

### Core Functionality Tests (Priority 1)
- [ ] Test 2.1: Context Menu Opens
- [ ] Test 2.2: Move Up Action
- [ ] Test 2.3: Move Down Action
- [ ] Test 2.4: Delete Node Action
- [ ] Test 2.5: Insert After Action
- [ ] Test 2.6: Insert Before Action
- [ ] Test 2.7: Edit Details Action

### Edge Cases & Restrictions (Priority 2)
- [ ] Test 2.8: Branch Point Restrictions
- [ ] Test 2.9: Possibility Node Restrictions
- [ ] Test 2.10: Plan Status Restrictions
- [ ] Test 2.11: First Node Move Up (Disabled)
- [ ] Test 2.12: Last Node Move Down (Disabled)
- [ ] Test 2.13: Multiple Incoming Edges (Delete Disabled)
- [ ] Test 2.14: Multiple Outgoing Edges (Delete Disabled)

### UI/UX & Accessibility (Priority 3)
- [ ] Test 2.15: Menu Positioning (Right Edge)
- [ ] Test 2.16: Menu Positioning (Bottom Edge)
- [ ] Test 2.17: Escape Key Closes Menu
- [ ] Test 2.18: Click Outside Closes Menu
- [ ] Test 2.19: Click on Node Closes Menu
- [ ] Test 2.20: Framer Motion Animations

### Regression Tests (Priority 4)
- [ ] Test 2.21: Existing Hover Buttons Still Work
- [ ] Test 2.22: Node Selection Still Works
- [ ] Test 2.23: Canvas Panning Not Broken
- [ ] Test 2.24: Branch Selection Modal Still Works
- [ ] Test 2.25: Multi-Plan Support

---

## 5. Known Issues & Concerns

### 5.1 Menu Dimension Hardcoding
**Location:** `ContextMenu.tsx` lines 127-128
**Issue:** Menu width (180px) and height (260px) are hardcoded approximations
**Impact:** LOW - If menu content changes, positioning calculation may be off by a few pixels
**Recommendation:** Use `useRef` + `getBoundingClientRect()` for dynamic measurement in future iteration

### 5.2 swapNodes Edge Case
**Location:** `plan-store.ts` lines 761-833
**Issue:** `swapNodes()` doesn't explicitly validate single predecessor/successor
**Impact:** LOW - Callers enforce constraints via `canMoveUp`/`canMoveDown` checks
**Mitigation:** PlanCanvas prevents invalid swaps before calling store method
**Recommendation:** Add defensive validation in swapNodes for safety

### 5.3 getAdjacentNodeIds Ambiguity
**Location:** `plan-store.ts` lines 836-852
**Issue:** Takes first match for multiple incoming/outgoing edges
**Impact:** LOW - Ambiguous behavior for complex graphs, but context menu already disabled for such nodes
**Mitigation:** Context menu only enabled for linear segments (single in/out edges)
**Recommendation:** No immediate action needed

---

## 6. Post-Testing Actions

### If All Tests Pass
1. Update memory with test results
2. Document any UI quirks or timing issues discovered
3. Recommend merge to main branch
4. Create follow-up issues for non-critical improvements (menu dimension measurement)

### If Any Test Fails
1. Document exact reproduction steps
2. Capture screenshot/video evidence
3. Identify root cause (component, line number)
4. Assess severity (blocker, critical, minor)
5. Report to development team with fix recommendations

---

## 7. Testing Environment Details

**System:**
- OS: macOS (Darwin 23.6.0)
- Node.js: Check with `node -v`
- npm: Check with `npm -v`

**Browser Requirements:**
- Chrome 120+ or Firefox 120+ (for Framer Motion support)
- DevTools available
- React DevTools extension installed (optional but recommended)

**Monitoring Tools:**
- Browser Console: WebSocket messages, errors
- React DevTools: Component state, Zustand store
- Network Tab: API requests (plan submission)

---

## 8. Success Criteria

### Minimum Acceptance Criteria (ALL must pass)
- [ ] All Priority 1 tests (2.1-2.7) pass without errors
- [ ] All Priority 2 tests (2.8-2.14) pass without errors
- [ ] No console errors during any test
- [ ] No regression in existing functionality (Priority 4 tests pass)

### Quality Criteria (SHOULD pass)
- [ ] All Priority 3 tests (2.15-2.20) pass
- [ ] Animations are smooth (60 FPS)
- [ ] Menu positioning works in all viewport sizes

### Exceptional Quality (NICE TO HAVE)
- [ ] Test coverage script created for automated testing
- [ ] Performance profiling shows no memory leaks
- [ ] Accessibility audit passes (ARIA labels, keyboard nav)

---

## 9. Final Verdict

**CODE REVIEW STATUS:** PASS
**RECOMMENDATION:** Proceed with manual testing protocol
**BLOCKING ISSUES:** None
**NON-BLOCKING ISSUES:** 3 (all low severity, documented in Section 5)

**NEXT STEPS:**
1. Execute manual testing protocol (Section 3)
2. Fill out test execution checklist (Section 4)
3. Document results and update memory
4. Recommend merge if all critical tests pass

---

**Report Generated By:** Principal QA Engineer (Claude Agent)
**Confidence Level:** HIGH (comprehensive code review completed)
**Estimated Manual Testing Time:** 90-120 minutes (all 25 tests)
