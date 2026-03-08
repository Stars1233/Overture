# Visual Test Checklist: Edge Pulsation Fix
**Print this checklist and use it during manual browser testing**

---

## Pre-Test Setup

- [ ] Development server running: `npm run dev`
- [ ] UI accessible at: http://localhost:3031
- [ ] Browser DevTools open (F12)
- [ ] Console tab visible (check for errors)
- [ ] Test plan submitted via: `./submit-test-plan.sh`

---

## Test 1: Branch Selection Visual Verification

### Steps
1. [ ] Load UI, observe plan rendered on canvas
2. [ ] Identify branch point node "Environment Check" (n2)
3. [ ] Note two outgoing edges to "Production Path" and "Staging Path"

### Before Selecting Branch
- [ ] Both branch path edges have normal styling
- [ ] No edges are dimmed yet

### After Selecting Production Branch
- [ ] Production path edges: Normal opacity (1.0)
- [ ] Staging path edges: Dimmed (opacity 0.3)
- [ ] Staging path edges: Dark gray color (#27272a)
- [ ] Staging path edges: NO animation/pulsation
- [ ] Staging path edges: NO `.edge-active-pulse` class

### DevTools Check
1. [ ] Right-click on unselected branch edge → Inspect
2. [ ] Verify in Styles panel: `opacity: 0.3`
3. [ ] Verify in Styles panel: `stroke: #27272a`
4. [ ] Verify in Elements panel: NO `edge-active-pulse` class
5. [ ] Verify NO animation on element

### Switch to Staging Branch
- [ ] Staging path edges: Now normal opacity
- [ ] Production path edges: Now dimmed (opacity 0.3)
- [ ] Production path edges: NO animation
- [ ] Styling updated immediately (no delay)

**RESULT**: PASS ☐ | FAIL ☐

---

## Test 2: Edge Animation During Execution

### Steps
1. [ ] Select Production branch
2. [ ] Click "Approve" button
3. [ ] Observe execution progress

### Initial State (First Node Running)
- [ ] Edge from "Initial Setup" to "Environment Check": Pulsating yellow
- [ ] Pulsating edge has `className: 'edge-active-pulse'`
- [ ] Pulsating edge has `stroke: #eab308` (yellow)
- [ ] Pulsating edge has `strokeWidth: 3`

### After First Node Completes
- [ ] Completed edge: Green (#22c55e)
- [ ] Completed edge: NO animation
- [ ] Next active edge: Pulsating yellow

### Unselected Branch Behavior
- [ ] Staging path edges: REMAIN DIMMED throughout execution
- [ ] Staging path edges: NEVER pulsate
- [ ] Staging path edges: Opacity stays 0.3
- [ ] NO visual artifacts or flashing

### DevTools Animation Check
1. [ ] Inspect active edge (should pulsate)
2. [ ] Verify `animated: true` in React Flow props
3. [ ] Inspect disabled edge (should NOT pulsate)
4. [ ] Verify `animated: false` in React Flow props

**RESULT**: PASS ☐ | FAIL ☐

---

## Test 3: Multi-Level Branches

### Steps
1. [ ] Load plan with nested branch point (n5)
2. [ ] Select Production at first branch (n2)
3. [ ] Observe edges to nested branch point

### First Level Selection
- [ ] Staging path (unselected): All downstream edges dimmed
- [ ] Staging path node "Staging Tests" edges: Dimmed
- [ ] Production path: All edges normal

### Second Level Selection (at n5)
1. [ ] Select "Full Monitoring" at nested branch
2. [ ] "Full Monitoring" path edges: Normal
3. [ ] "Basic Monitoring" path edges: Dimmed
4. [ ] First-level unselected (Staging) still dimmed

### Combined State Check
- [ ] Production → Full Monitoring path: Normal styling
- [ ] Production → Basic Monitoring path: Dimmed
- [ ] Staging → Full Monitoring path: Dimmed
- [ ] Staging → Basic Monitoring path: Dimmed
- [ ] NO edge incorrectly inherits state from parent

**RESULT**: PASS ☐ | FAIL ☐

---

## Test 4: Branch Switching Mid-Execution

### Steps
1. [ ] Start execution with Production branch selected
2. [ ] While executing (before reaching branch), switch to Staging
3. [ ] Observe edge styling changes

### Immediate Visual Update
- [ ] Production edges: Immediately dimmed
- [ ] Staging edges: Immediately un-dimmed
- [ ] NO stale animations on previously selected edges
- [ ] Active edge updates to new path

### Execution Continuation
- [ ] Execution continues on newly selected path (Staging)
- [ ] Production nodes: Not executed
- [ ] Staging nodes: Executed in sequence

**RESULT**: PASS ☐ | FAIL ☐

---

## Test 5: Edge Styling Details

### Disabled Edge (Unselected Branch)
- [ ] `opacity: 0.3`
- [ ] `stroke: #27272a` (dark gray)
- [ ] `strokeWidth: 2`
- [ ] `animated: false`
- [ ] `className`: NO 'edge-active-pulse'

### Active Edge (Selected Path, Executing Node)
- [ ] `opacity: 1`
- [ ] `stroke: #eab308` (yellow)
- [ ] `strokeWidth: 3`
- [ ] `animated: true`
- [ ] `className: 'edge-active-pulse'`

### Completed Edge
- [ ] `opacity: 1`
- [ ] `stroke: #22c55e` (green)
- [ ] `strokeWidth: 2`
- [ ] `animated: false`

### Pending Edge (Selected Path, Not Yet Executed)
- [ ] `opacity: 1`
- [ ] `stroke: #3f3f46` (gray)
- [ ] `strokeWidth: 2`
- [ ] `animated: false`

**RESULT**: PASS ☐ | FAIL ☐

---

## Test 6: Console Errors

### During All Tests
- [ ] NO errors in browser console
- [ ] NO warnings related to edges or animation
- [ ] NO React warnings about state updates

### WebSocket Connection
- [ ] Connection established successfully
- [ ] NO disconnection errors
- [ ] Messages logged correctly

**RESULT**: PASS ☐ | FAIL ☐

---

## Test 7: Regression - Existing Features

### Core Functionality
- [ ] Plan renders correctly on canvas
- [ ] Nodes display with correct status colors
- [ ] Node detail panel opens on click
- [ ] Branch selection modal works

### Approve Button
- [ ] Shows correct state (disabled when requirements pending)
- [ ] Enables when all branches selected
- [ ] Approves plan successfully

### Requirements Checklist
- [ ] Shows pending branch selections
- [ ] Updates when branch selected
- [ ] Clears when all requirements met

### Multi-Project
- [ ] Multiple project tabs work
- [ ] Can switch between projects
- [ ] Each project maintains separate state

**RESULT**: PASS ☐ | FAIL ☐

---

## Test 8: Browser Compatibility (Optional)

Test in multiple browsers if possible:

### Chrome/Edge
- [ ] Edges render correctly
- [ ] Animations smooth
- [ ] NO visual glitches

### Firefox
- [ ] Edges render correctly
- [ ] Animations smooth
- [ ] NO visual glitches

### Safari
- [ ] Edges render correctly
- [ ] Animations smooth
- [ ] NO visual glitches

**RESULT**: PASS ☐ | FAIL ☐

---

## Final Checklist

### All Tests
- [ ] Test 1: Branch Selection - PASSED
- [ ] Test 2: Edge Animation - PASSED
- [ ] Test 3: Multi-Level Branches - PASSED
- [ ] Test 4: Branch Switching - PASSED
- [ ] Test 5: Edge Styling - PASSED
- [ ] Test 6: Console Errors - PASSED
- [ ] Test 7: Regression Tests - PASSED
- [ ] Test 8: Browser Compatibility - PASSED (Optional)

### Evidence Collection
- [ ] Screenshots of unselected branch edges (dimmed)
- [ ] Screenshot of active edge pulsating
- [ ] Screenshot of multi-level branches
- [ ] Console log (no errors)
- [ ] DevTools edge inspection (showing correct styles)

### Sign-Off
- [ ] All critical tests passed
- [ ] All regression tests passed
- [ ] NO bugs or issues found
- [ ] Feature ready for merge

---

## Bug Report Template (If Tests Fail)

**Test Failed**: [Test number and name]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Steps to Reproduce**:
1.
2.
3.

**Screenshots**:
[Attach screenshots]

**Browser**:
[Chrome/Firefox/Safari version]

**Console Errors**:
```
[Paste console errors here]
```

**Severity**: Critical ☐ | High ☐ | Medium ☐ | Low ☐

---

**Test Date**: ___________
**Tester Name**: ___________
**Test Duration**: ___________ minutes
**Overall Result**: PASS ☐ | FAIL ☐

**Notes**:
_______________________________________________
_______________________________________________
_______________________________________________
