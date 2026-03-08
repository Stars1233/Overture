# Manual Test Protocol: Help Modal Feature

**Date**: 2026-03-04
**Tester**: Principal QA Engineer
**Environment**: http://localhost:3031
**Feature Branch**: feature/right_click_options

---

## Pre-Test Verification

### Environment Check
- [ ] Navigate to http://localhost:3031 in browser
- [ ] Open DevTools (F12) → Console tab
- [ ] Verify no console errors on page load
- [ ] Verify WebSocket connection established (look for "Connected" in header)

---

## Test Suite 1: Help Button Visibility (Critical)

### Test 1.1: Help Button Rendering
**Objective**: Verify help button appears in header

**Steps**:
1. Look at the Header bar (top of page)
2. Find the button row on the right side
3. Locate button with HelpCircle icon

**Expected**:
- Help button visible between History and Settings buttons
- HelpCircle icon rendered
- Hover shows tooltip "Help & Documentation"

**Pass Criteria**: Help button visible and clickable

---

## Test Suite 2: Modal Opening (Critical)

### Test 2.1: Click to Open
**Steps**:
1. Click Help button in header

**Expected**:
- Modal opens instantly
- Full-screen overlay appears
- Fade-in animation plays
- Focus moves to modal

**Pass Criteria**: Modal opens on click

### Test 2.2: Keyboard Shortcut
**Steps**:
1. Press `?` key (Shift + /)
2. Verify modal opens

**Expected**:
- Modal opens without clicking button
- Same behavior as clicking

**Pass Criteria**: `?` key opens modal

### Test 2.3: Input Field Protection
**Steps**:
1. Close modal if open
2. Click in search box (or any input field)
3. Press `?` key while cursor in input

**Expected**:
- Modal does NOT open
- `?` character appears in input field

**Pass Criteria**: Keyboard shortcut disabled when typing

---

## Test Suite 3: Modal Layout (Critical)

### Test 3.1: Full-Screen Display
**Expected**:
- Modal covers entire viewport
- No scrollable background visible
- Header with "Help & Documentation" title
- Close (X) button in top-right

**Pass Criteria**: Proper full-screen modal

### Test 3.2: Sidebar Structure
**Expected**:
- Left sidebar ~64px wide
- Search box at top of sidebar
- "Topics" heading
- 8 category buttons listed:
  1. Getting Started (Rocket icon)
  2. Plan Workflow (Play icon)
  3. Node Operations (MousePointer icon)
  4. Branch Selection (GitBranch icon)
  5. Dynamic Fields (FormInput icon)
  6. MCP Servers (Server icon)
  7. Troubleshooting (AlertTriangle icon)
  8. Keyboard Shortcuts (Keyboard icon)
- GitHub Repository link at bottom

**Pass Criteria**: All 8 categories visible with icons

### Test 3.3: Main Content Area
**Expected**:
- Large content area to right of sidebar
- Shows category header with icon
- Lists sections for selected category
- Numbered sections (1, 2, 3...)

**Pass Criteria**: Content area renders correctly

---

## Test Suite 4: Category Navigation (Critical)

### Test 4.1: Click Each Category
**Steps**: Click each of the 8 categories in order

**Expected for EACH**:
1. Category highlights with blue background
2. Content area updates to show that category
3. Category icon and title appear as header
4. All sections for that category render
5. Section numbering starts at 1

**Pass Criteria**: All 8 categories navigate correctly

**Categories to Test**:
- [ ] Getting Started (3 sections)
- [ ] Plan Workflow (4 sections)
- [ ] Node Operations (5 sections)
- [ ] Branch Selection (3 sections)
- [ ] Dynamic Fields (3 sections)
- [ ] MCP Servers (3 sections)
- [ ] Troubleshooting (5 sections)
- [ ] Keyboard Shortcuts (1 section)

### Test 4.2: Active Category Indicator
**Steps**:
1. Click "Getting Started"
2. Verify it has blue background/text
3. Click "MCP Servers"
4. Verify Getting Started no longer highlighted
5. Verify MCP Servers is now highlighted

**Pass Criteria**: Only one category highlighted at a time

---

## Test Suite 5: Search Functionality (Critical)

### Test 5.1: Basic Search
**Steps**:
1. Type "branch" in search box

**Expected**:
- Results appear in main content area
- Shows "Search Results" heading
- Shows count like "5 results for 'branch'"
- Each result shows:
  - Category badge (e.g., "Branch Selection")
  - Section title
  - Content preview (first ~150 chars)

**Pass Criteria**: Search returns relevant results

### Test 5.2: Search Result Click
**Steps**:
1. Search for "approval"
2. Click first result

**Expected**:
- Search query clears
- Navigate to that category
- Scroll to the specific section
- Section highlights with blue ring

**Pass Criteria**: Click navigates to section

### Test 5.3: Empty Search Results
**Steps**:
1. Type "xyznonexistent" in search

**Expected**:
- Shows "0 results for 'xyznonexistent'"
- Empty state with search icon
- Message "No results found"
- Suggestion "Try different keywords"

**Pass Criteria**: Handles no results gracefully

### Test 5.4: Search Clear
**Steps**:
1. Search for something
2. Click a category button

**Expected**:
- Search query clears
- Returns to category view

**Pass Criteria**: Category click clears search

---

## Test Suite 6: Content Rendering (CRITICAL - BUG EXPECTED)

### Test 6.1: Bold Text
**Steps**:
1. Navigate to "Getting Started" → "What is Overture?"
2. Look for text like "Key Benefits:" (line 37)

**Expected**:
- Bold headings render in darker, heavier font
- Text following `**` markers is bold

**Pass Criteria**: Bold text styled correctly

### Test 6.2: Inline Code
**Steps**:
1. Navigate to "Plan Workflow" → "Submitting Plans"
2. Look for plan states like `streaming`, `ready`, etc. (lines 127-133)

**Expected**:
- Inline code in purple color
- Rounded background (pill shape)
- Monospace font

**Pass Criteria**: Inline code styled correctly

### Test 6.3: Code Blocks
**Steps**:
1. Look for any multi-line code examples

**Expected**:
- Gray background box
- Monospace font
- Scrollable if long

**Pass Criteria**: Code blocks render correctly

### Test 6.4: Tables - Main Content
**Steps**:
1. Navigate to any category with tables

**Expected**:
- Table with header row
- Borders between rows
- Proper spacing

**Pass Criteria**: Tables render correctly

### Test 6.5: **KEYBOARD SHORTCUTS TABLE (BUG VERIFICATION)**
**Steps**:
1. Navigate to "Keyboard Shortcuts" → "Shortcuts Reference"
2. Scroll to the table with shortcuts (lines 802-828)

**CRITICAL CHECK**:
Look at the "Shortcut" column entries:
- Line 804: `Enter`
- Line 805: `Space`
- Line 806: `Escape`
- Line 826: `?`

**EXPECTED (if bug fixed)**:
- Each shortcut like `Enter` appears in purple box
- Monospace font
- Styled as inline code

**ACTUAL (if bug exists)**:
- Shows literal backticks: `` `Enter` ``
- Plain text, not styled
- No purple background

**This is the HIGH SEVERITY BUG - document what you see**

**Pass Criteria**: Inline code in tables renders correctly (BUG if not)

### Test 6.6: Lists
**Steps**:
1. Navigate to sections with bullet points
2. Look for numbered lists

**Expected**:
- Bullets/numbers aligned
- Proper indentation
- Readable spacing

**Pass Criteria**: Lists render correctly

---

## Test Suite 7: Modal Interactions (Critical)

### Test 7.1: Close Button
**Steps**:
1. Click X button in top-right

**Expected**:
- Modal closes with fade-out animation
- Returns to main plan view
- Can reopen modal

**Pass Criteria**: X button closes modal

### Test 7.2: Escape Key (BUG VERIFICATION)
**Steps**:
1. Open modal
2. Press Escape key

**EXPECTED (if bug fixed)**:
- Modal closes immediately
- Returns to main plan view

**ACTUAL (if bug exists)**:
- Nothing happens
- Modal stays open
- Must use X button to close

**This is the MEDIUM SEVERITY BUG - document what you see**

**Pass Criteria**: Escape closes modal (BUG if not)

---

## Test Suite 8: Animations (Medium Priority)

### Test 8.1: Enter Animation
**Steps**:
1. Close and reopen modal

**Expected**:
- Smooth fade-in
- Content appears progressively
- Framer Motion animation

**Pass Criteria**: Enter animation smooth

### Test 8.2: Exit Animation
**Steps**:
1. Close modal with X button

**Expected**:
- Smooth fade-out
- Modal disappears cleanly

**Pass Criteria**: Exit animation smooth

### Test 8.3: Section Animations
**Steps**:
1. Navigate to category with 3+ sections

**Expected**:
- Sections appear with stagger effect
- Each section animates in slightly delayed

**Pass Criteria**: Section animations present

---

## Test Suite 9: External Links (Low Priority)

### Test 9.1: GitHub Link
**Steps**:
1. Scroll sidebar to bottom
2. Click "GitHub Repository" link

**Expected**:
- Opens https://github.com/SixHq/overture
- Opens in NEW tab (target="_blank")
- Original modal stays open

**Pass Criteria**: Link opens correctly

---

## Test Suite 10: Scroll Behavior (Medium Priority)

### Test 10.1: Scroll to Section
**Steps**:
1. Navigate to "Troubleshooting" (5 sections)
2. Click category to load content
3. Search for "performance"
4. Click search result

**Expected**:
- Page scrolls smoothly to "Performance Issues" section
- Section highlights with blue ring
- Section visible at top of content area

**Pass Criteria**: Smooth scroll works

### Test 10.2: Sidebar Scrolling
**Steps**:
1. Resize browser to make sidebar shorter
2. Try scrolling categories

**Expected**:
- Categories scrollable if overflow
- Search box stays fixed at top
- GitHub link stays at bottom

**Pass Criteria**: Sidebar scrolls correctly

---

## Test Suite 11: Responsive Behavior (Low Priority)

### Test 11.1: Window Resize
**Steps**:
1. Resize browser window to various sizes

**Expected**:
- Modal stays full-screen
- Content remains readable
- Sidebar may shrink but stays visible

**Pass Criteria**: Responsive to window size

---

## Test Suite 12: Console Errors (Critical)

### Test 12.1: No JavaScript Errors
**Steps**:
1. Keep DevTools Console open during all tests
2. Monitor for errors, warnings

**Expected**:
- No console errors during any operation
- No React warnings
- No failed network requests

**Pass Criteria**: Zero console errors

---

## Test Suite 13: Regression Testing (Critical)

### Test 13.1: Header Functionality
**Objective**: Verify help modal doesn't break existing header

**Steps**:
1. Close help modal
2. Test Settings button → verify modal opens
3. Test History button → verify panel toggles
4. Test Pause/Resume if plan active

**Expected**:
- All header buttons still work
- No interference from help modal

**Pass Criteria**: No regression in header

### Test 13.2: Canvas Functionality
**Steps**:
1. Close help modal
2. Test plan canvas interactions:
   - Pan canvas
   - Zoom in/out
   - Click nodes
   - View node details

**Expected**:
- Canvas still fully functional
- No lag or performance issues

**Pass Criteria**: Canvas unaffected

---

## Known Issues to Verify

### BUG #1: Keyboard Shortcuts Table Formatting (HIGH)
**Test**: Suite 6, Test 6.5
**Expected Result**: FAIL (bug exists)
**Fix Required**: Add `renderInlineFormatting()` to final table renderer

### BUG #2: Escape Key Handler (MEDIUM)
**Test**: Suite 7, Test 7.2
**Expected Result**: FAIL (bug exists)
**Fix Required**: Add keyboard event listener for Escape key

### BUG #3: Redundant Keyboard Check (LOW)
**Test**: No functional impact
**Fix Required**: Clean up Header.tsx line 35

---

## Test Execution Checklist

Mark each test as you complete it:

**Suite 1: Help Button**
- [ ] 1.1 Button rendering

**Suite 2: Modal Opening**
- [ ] 2.1 Click to open
- [ ] 2.2 Keyboard shortcut
- [ ] 2.3 Input protection

**Suite 3: Layout**
- [ ] 3.1 Full-screen
- [ ] 3.2 Sidebar structure
- [ ] 3.3 Content area

**Suite 4: Navigation**
- [ ] 4.1 All 8 categories
- [ ] 4.2 Active indicator

**Suite 5: Search**
- [ ] 5.1 Basic search
- [ ] 5.2 Result click
- [ ] 5.3 Empty results
- [ ] 5.4 Search clear

**Suite 6: Content Rendering**
- [ ] 6.1 Bold text
- [ ] 6.2 Inline code
- [ ] 6.3 Code blocks
- [ ] 6.4 Tables (main)
- [ ] 6.5 **KEYBOARD TABLE (BUG CHECK)**
- [ ] 6.6 Lists

**Suite 7: Interactions**
- [ ] 7.1 Close button
- [ ] 7.2 **ESCAPE KEY (BUG CHECK)**

**Suite 8: Animations**
- [ ] 8.1 Enter
- [ ] 8.2 Exit
- [ ] 8.3 Sections

**Suite 9: External Links**
- [ ] 9.1 GitHub link

**Suite 10: Scrolling**
- [ ] 10.1 Scroll to section
- [ ] 10.2 Sidebar scroll

**Suite 11: Responsive**
- [ ] 11.1 Window resize

**Suite 12: Console**
- [ ] 12.1 No errors

**Suite 13: Regression**
- [ ] 13.1 Header
- [ ] 13.2 Canvas

---

## Test Results Template

```
## Test Execution Results

**Date**: [DATE]
**Environment**: http://localhost:3031
**Browser**: [Chrome/Firefox/Safari + version]

### Summary
- Tests Executed: X/25
- Passed: X
- Failed: X
- Blocked: X

### Critical Failures
1. [BUG #1: Keyboard Shortcuts Table] - Status: [CONFIRMED/FIXED]
2. [BUG #2: Escape Key Handler] - Status: [CONFIRMED/FIXED]

### Screenshots
- [Attach screenshots of bugs]

### Console Errors
- [List any console errors]

### Recommendations
- [Priority fixes]
- [Optional improvements]
```

---

## Priority Test Order

If time is limited, execute in this order:

1. **Suite 1** (Button visibility) - 2 min
2. **Suite 2** (Modal opening) - 3 min
3. **Suite 4** (Category navigation) - 5 min
4. **Suite 6.5** (KEYBOARD TABLE BUG) - 2 min ⚠️
5. **Suite 7.2** (ESCAPE KEY BUG) - 1 min ⚠️
6. **Suite 5** (Search) - 5 min
7. **Suite 12** (Console errors) - ongoing
8. **Suite 13** (Regression) - 5 min

**Minimum viable test**: 23 minutes covering critical functionality and both known bugs
