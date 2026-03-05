# Principal QA Engineer Memory

## Reliable CSS Selectors for Overture UI

### React Flow Canvas
- Canvas container: `.react-flow__viewport`
- Nodes: `.react-flow__node`
- Edges: `.react-flow__edge`
- Edge paths: `.react-flow__edge-path`

### Node Elements
- Task nodes: `[data-id*=":"]` (contains plan:node format)
- Node status indicators: Check node data attributes
- Context menu: `min-w-[180px]` fixed-position motion.div (z-index 9999)

### Node Detail Panel
- Panel container: `.absolute.top-0.right-0` (motion.div)
- Description section: Look for "Description" heading
- Edit button: Pencil icon button (Lucide `Pencil` component)
- Textarea: `textarea` with `value={editedDescription}`
- Save button: Button with "Save" text
- Cancel button: Button with "Cancel" text

### Edge Styling States
- Active edge class: `.edge-active-pulse`
- Disabled edges: Check `opacity: 0.3` and `stroke: #27272a`
- Active edges: `stroke: #eab308`, `strokeWidth: 3`
- Executed edges: `stroke: #22c55e`

### Context Menu Testing Selectors
- Menu container: `[style*="position: fixed"]` with `zIndex: 9999`
- Menu items: `button` with hover states
- Disabled items: `button[disabled]` with `cursor-not-allowed`
- Menu dividers: `.h-px.bg-border`

## Known Issues & Patterns

### Context Menu Design Pattern (Implemented 2026-03-04)
- **Trigger**: Right-click on task nodes
- **Restrictions**: Only available when `plan.status === 'ready'` AND node is not a branch point AND node is not a branch target
- **Positioning**: Viewport-aware (adjusts if would overflow right or bottom edge)
- **Close Behavior**: Escape key OR click outside (capture phase)
- **Actions**: Move Up/Down (swap adjacent), Delete (reconnect edges), Insert Before/After, Edit Details
- **Test Pattern**: Always verify action availability flags before testing actions

### Edge Pulsation Bug (Fixed)
- **Issue**: Edges connected to unselected branch nodes were pulsating incorrectly
- **Fix**: Added `disabledNodeIds` Set check before edge conversion
- **Critical Check**: `shouldAnimate = isActiveEdge && !isDisabledEdge`
- **Test Pattern**: Always verify edge styling on both selected AND unselected branch paths

### Editable Node Descriptions (Implemented 2026-03-04)
- **Feature**: Users can edit node descriptions before plan approval
- **Visibility**: Pencil icon only appears when `plan.status === 'ready'`
- **State Reset**: Edit mode resets when switching between nodes
- **Persistence**: Updates auto-saved to history via `persistToHistory`
- **Multi-User Sync**: Changes broadcast via WebSocket `node_description_updated` message
- **Test Pattern**: Verify edit icon visibility, save/cancel behavior, node switching, and multi-user sync

## Test Execution Notes

### Browser Automation Limitations
- **Playwright MCP**: Not available for automated browser testing (permission denied)
- **Testing Approach**: Code review + manual testing protocol with API submission
- **API Endpoint**: POST to `http://localhost:3031/api/test-plan` with XML payload

### Timing & Race Conditions
- WebSocket connection to port 3030 may take 1-2 seconds
- Plan rendering is async - wait for nodes to appear before testing
- Edge animations update on status changes - allow 500ms for transitions
- Description updates are optimistic (local update before server confirm)
- Context menu opening is synchronous (no delay)

### Branch Testing Best Practices
1. Always test with plans containing multiple branch points
2. Verify BOTH selected and unselected paths simultaneously
3. Check edge styling before, during, and after execution
4. Test branch switching scenarios (change selection mid-execution)

### Context Menu Testing Best Practices
1. Test on linear nodes first (single in/out edges)
2. Verify restrictions on branch points (should be disabled)
3. Verify restrictions on branch targets (should be disabled)
4. Test plan status transitions (ready → approved → executing)
5. Test edge cases: first node, last node, convergence points
6. Test viewport positioning (near edges)
7. Test keyboard interactions (Escape key)

**CRITICAL FIX (2026-03-05):** Browser context menu override
- **Issue**: Browser's native context menu was appearing instead of custom menu
- **Root Cause**: `event.preventDefault()` was called conditionally AFTER permission checks
- **Fix**: Moved `preventDefault()` and `stopPropagation()` to execute UNCONDITIONALLY at handler start
- **Location**: `TaskNode.tsx` lines 67-68 (before conditional logic at line 71)
- **Test Pattern**: Right-click ANY node - browser menu should NEVER appear (regardless of canShowContextMenu)

## Recent Test Sessions

### 2026-03-04: Right-Click Context Menu (Current Branch: feature/right_click_options)
- **Feature**: Context menu on task nodes with Move Up/Down, Delete, Insert Before/After, Edit Details actions
- **Test Type**: Code Review (Browser automation unavailable)
- **Result**: CODE PASS | NO BLOCKING BUGS | MANUAL TESTING REQUIRED
- **Files Changed**:
  - New: `packages/ui/src/components/Canvas/ContextMenu.tsx` (245 lines)
  - Modified: `packages/ui/src/components/Canvas/TaskNode.tsx` (handleContextMenu, lines 65-72)
  - Modified: `packages/ui/src/components/Canvas/PlanCanvas.tsx` (context menu state + handlers, lines 570-856)
  - Modified: `packages/ui/src/stores/plan-store.ts` (swapNodes, getAdjacentNodeIds, pendingInsertBefore, lines 761-859)
- **Implementation Quality**: Excellent (95% complete, 3 low-severity notes)
- **Key Features Verified**:
  - ✅ Context menu at cursor position with viewport adjustment
  - ✅ Escape key + click-outside handlers (capture phase)
  - ✅ Plan status restriction (only status='ready')
  - ✅ Branch point restriction (isBranchPoint nodes blocked)
  - ✅ Branch target restriction (nodes with branchSourceId blocked)
  - ✅ Move up/down with adjacency validation
  - ✅ Delete with edge reconnection
  - ✅ Insert before/after with pending state
  - ✅ Edit details opens NodeDetailPanel
  - ✅ Disabled state styling
  - ✅ Multi-project support (planId scoped)
- **Business Logic Validation**:
  - `canShowContextMenu`: Checks plan.status, isBranchPoint, branchSourceId (CORRECT)
  - `canMoveUp/Down`: Validates single predecessor/successor (CORRECT)
  - `canDelete`: Requires single incoming + outgoing edge (CORRECT)
  - `swapNodes`: Reverses edge direction, rebuilds connections (CORRECT)
- **Non-Blocking Issues**:
  1. LOW: Menu dimensions hardcoded (180x260px) - recommend dynamic measurement in future
  2. LOW: swapNodes doesn't validate constraints (mitigated by caller checks)
  3. LOW: getAdjacentNodeIds takes first match for multiple edges (mitigated by menu disabled for such nodes)
- **Test Artifacts Created**:
  - `TEST_REPORT_RIGHT_CLICK_CONTEXT_MENU.md` - 25 test scenarios, 4 priority levels
  - `test-plan-linear.xml` - Linear plan (tests 2.1-2.7, 2.11-2.12)
  - `test-plan-branches.xml` - Branch plan (tests 2.8-2.9)
  - `test-plan-convergence.xml` - Convergence plan (test 2.13)
  - `test-context-menu.sh` - Automated test submission script
- **Manual Testing Required**: 25 tests across 4 priorities (90-120 min estimated)
- **Status**: READY FOR MANUAL TESTING
- **Recommendation**: Merge after Priority 1 (Core) and Priority 2 (Edge Cases) tests pass

See additional test sessions in lines 150-355 below (maintained for continuity).
