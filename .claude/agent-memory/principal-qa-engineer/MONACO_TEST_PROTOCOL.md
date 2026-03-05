# Monaco Editor Integration - Manual Testing Protocol
**Test Date**: 2026-03-04
**Feature**: Monaco Editor for Structured Output
**Tester**: Principal QA Engineer (Agent)

---

## Pre-Test Setup

### 1. Start Development Environment
```bash
cd /Users/Opeyemi/Downloads/sixth-mcp/overture
npm run dev
```

### 2. Open Browser
- Navigate to: http://localhost:3031
- Open Developer Console (F12) for monitoring

### 3. Verify Application Load
- [ ] Canvas renders without errors
- [ ] WebSocket connects (check Network tab)
- [ ] No console errors on initial load

---

## Test Scenarios

### Scenario 1: Basic Diff Display

**Test Data**: Submit plan with simple TypeScript file change

**Expected Results**:
- [ ] Monaco Editor renders in FileChangeItem
- [ ] Line numbers visible on left side
- [ ] Dark theme matches app (#18181b background)
- [ ] Diff content displays with proper formatting
- [ ] Scrollbar appears if content exceeds editor height

**How to Verify**:
1. Submit test plan (use /api/test-plan endpoint with test data)
2. Execute a node that produces file changes
3. Check NodeDetailPanel for StructuredOutputView
4. Expand "Files Changed" section
5. Expand individual file item
6. Inspect Monaco Editor instance

**Console Checks**:
- Look for "Loading editor..." message
- No Monaco initialization errors
- Theme "overture-dark" applied

---

### Scenario 2: Syntax Highlighting Verification

**Test Multiple File Types**:
- [ ] `.ts` / `.tsx` - TypeScript (keywords blue, strings green)
- [ ] `.js` / `.jsx` - JavaScript
- [ ] `.py` - Python (def, class keywords highlighted)
- [ ] `.json` - JSON (keys, values colored)
- [ ] `.css` - CSS (selectors, properties colored)
- [ ] `.html` - HTML (tags, attributes colored)
- [ ] `.md` - Markdown (headers, code blocks styled)
- [ ] `.go` - Go
- [ ] `.rs` - Rust
- [ ] `.sh` - Shell script
- [ ] `Dockerfile` - Dockerfile syntax
- [ ] `.yml` / `.yaml` - YAML

**How to Verify**:
1. Submit plan with multiple file types
2. For each file, verify syntax highlighting matches language
3. Check that keywords, strings, comments are colored appropriately
4. Verify language ID in Monaco (can inspect via browser devtools)

**Visual Checks**:
- Keywords should be distinct color (usually blue/purple)
- Strings should be green/orange
- Comments should be muted color
- Numbers should be distinct

---

### Scenario 3: Collapsible Sections

**Test Expand/Collapse**:
- [ ] Initial state: collapsed
- [ ] Click to expand: smooth animation (200ms)
- [ ] Monaco loads after expansion
- [ ] Click to collapse: smooth animation
- [ ] Monaco properly unmounts/cleans up
- [ ] Multiple files: independent expand states

**How to Verify**:
1. Plan with 3+ file changes
2. Expand first file → verify animation smooth
3. Expand second file → first remains expanded
4. Collapse first → second remains expanded
5. Check for memory leaks (expand/collapse 20 times, monitor memory)

**Performance Checks**:
- Animation doesn't stutter
- No flashing or layout shifts
- Memory usage stable (check Performance tab)

---

### Scenario 4: Copy Button Functionality

**Test Copy Feature**:
- [ ] Copy button visible on collapsed state
- [ ] Click copy → clipboard updated
- [ ] Visual feedback: checkmark icon appears
- [ ] Green checkmark color (#22c55e)
- [ ] Feedback resets after 2 seconds
- [ ] Multiple files: independent copy states

**How to Verify**:
1. Expand file with diff
2. Click copy button
3. Paste into text editor → verify full diff content copied
4. Observe icon change: Copy → Check
5. Wait 2 seconds → icon returns to Copy
6. Test with special characters, long diffs

**Edge Cases**:
- Empty diff (shouldn't crash)
- Diff with unicode characters
- Very large diff (1000+ lines)

---

### Scenario 5: Dynamic Height Calculation

**Test Different Content Sizes**:
- [ ] Small diff (5 lines): height ~106px (5*18 + 16)
- [ ] Medium diff (50 lines): height ~300px (clamped to max)
- [ ] Large diff (200 lines): height 300px (clamped to max, scrollbar visible)
- [ ] Single line: height 80px (clamped to min)

**How to Verify**:
1. Inspect Monaco Editor container in DevTools
2. Check computed height style
3. Verify min height: 80px
4. Verify max height: 300px
5. For large diffs: scrollbar appears
6. For small diffs: no unnecessary whitespace

**Calculation Formula**:
```
height = Math.max(80, Math.min((lineCount * 18 + 16), 300))
```

---

### Scenario 6: Monaco Editor Features

**Test Read-Only Mode**:
- [ ] Cannot type in editor
- [ ] Cannot delete text
- [ ] Cannot paste
- [ ] Selection works (click + drag)
- [ ] Context menu disabled (right-click does nothing)

**Test Code Features**:
- [ ] Code folding: expand/collapse works
- [ ] Line numbers: sequential, starts at 1
- [ ] Scroll: vertical scroll works for long diffs
- [ ] Find: Cmd+F opens find widget (native Monaco feature)

**How to Verify**:
1. Open large diff file
2. Try to edit text → should be blocked
3. Select text → highlight appears
4. Right-click → no context menu
5. Hover over code folding icon → expand/collapse
6. Cmd+F → find widget appears

---

### Scenario 7: Theme Integration

**Verify Custom Theme Colors**:
- [ ] Background: #18181b (matches app surface)
- [ ] Foreground: #fafafa (text-primary)
- [ ] Line numbers: #71717a (text-muted)
- [ ] Active line number: #a1a1aa (text-secondary)
- [ ] Selection: #3b82f640 (accent-blue with opacity)
- [ ] Gutter: #18181b (matches background)
- [ ] Scrollbar: #3f3f4680 (border with opacity)

**How to Verify**:
1. Inspect Monaco Editor in DevTools
2. Check computed background-color on editor div
3. Verify line number color
4. Select text → verify selection background color
5. Compare with app theme colors in Tailwind config

**Visual Consistency**:
- Editor blends seamlessly with panel
- No jarring color differences
- Dark theme throughout (no white flashes)

---

### Scenario 8: Files Created Display

**Test FileCreatedItem**:
- [ ] Path displayed correctly
- [ ] Line count shown if available
- [ ] Clean minimal UI (no Monaco for created files)
- [ ] Background: surface/50 (#18181b80)

**How to Verify**:
1. Plan with files_created section
2. Expand "Files Created"
3. Verify each file shows: path + line count
4. No expand/collapse functionality (not needed)
5. Font: monospace for path

---

### Scenario 9: Diff Content Normalization

**Test Edge Cases**:
- [ ] Diff with \r\n line endings → normalized to \n
- [ ] Diff with leading empty lines → removed
- [ ] Diff with trailing empty lines → removed
- [ ] Diff with excessive indentation → dedented
- [ ] Diff markers (+, -, @) preserved correctly

**How to Verify**:
1. Manually inspect normalized diff in DevTools
2. Check that line endings are consistent
3. Verify no extra blank lines at start/end
4. Confirm dedenting doesn't break diff format
5. Test with unusual formatting:
   - Mixed tabs/spaces
   - Inconsistent indentation
   - CRLF vs LF

**Test Data Examples**:
```
// Leading empty lines (should be removed)


@@ -1,5 +1,5 @@
function test() {
-  return false;
+  return true;
}

// Trailing empty lines (should be removed)


```

---

### Scenario 10: Performance Testing

**Test Load Performance**:
- [ ] Single diff: loads < 100ms
- [ ] 5 diffs: loads < 500ms
- [ ] 20 diffs: loads < 2s
- [ ] Very large diff (5000 lines): loads without freezing

**Test Scroll Performance**:
- [ ] Smooth scrolling in Monaco editor
- [ ] No lag when scrolling large diffs
- [ ] Syntax highlighting doesn't slow down scroll

**Test Memory Usage**:
1. Open Performance Monitor in DevTools
2. Expand 20 file changes
3. Monitor memory usage
4. Collapse all → memory should release
5. No memory leaks over time

**Benchmarks**:
- Initial load: < 1s
- Monaco mount: < 200ms per editor
- Syntax highlighting: real-time (no delay)
- Collapse/expand animation: 60fps

---

## Additional Checks

### Browser Compatibility
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari

### Accessibility
- [ ] Keyboard navigation works
- [ ] Tab key moves between elements
- [ ] Enter key expands/collapses
- [ ] Screen reader compatibility (aria labels)

### Responsive Behavior
- [ ] Wide screen (1920px+): full width
- [ ] Narrow panel (400px): wraps properly
- [ ] Editor auto-resizes with panel width

### Error Handling
- [ ] Invalid language → falls back to plaintext
- [ ] Missing diff content → shows file header only
- [ ] Monaco load failure → shows loading message
- [ ] Network error → graceful degradation

---

## Success Criteria

All test scenarios must PASS with:
- ✅ No console errors
- ✅ Smooth animations (60fps)
- ✅ Correct syntax highlighting for all languages
- ✅ Theme matches app design system
- ✅ Memory usage stable (< 100MB increase)
- ✅ All interactive features functional

**Any single FAIL = Feature not ready for production**

---

## Regression Tests

After Monaco integration, verify existing features still work:
- [ ] Plan canvas renders correctly
- [ ] Node detail panel displays
- [ ] Other StructuredOutput sections work (Overview, Notes, Packages, etc.)
- [ ] Expandable sections animate properly
- [ ] Page performance not degraded
- [ ] WebSocket updates still trigger re-renders

---

## Notes for Tester

### Known Limitations
- Vue/Svelte files use HTML language mode (acceptable, not ideal)
- Minimap disabled (intentional design choice)
- Context menu disabled (intentional for read-only)

### What to Watch For
- White flashes during Monaco initialization
- Layout shifts when editor loads
- Memory leaks with expand/collapse
- Syntax highlighting delays on large files
- Scrollbar styling inconsistencies

### Debugging Tools
- React DevTools: Check component re-renders
- Performance Monitor: Track memory, FPS
- Network Tab: Monitor Monaco loader requests
- Console: Look for Monaco warnings/errors

---

## Test Data Location

See `monaco-test-data.xml` for sample test plans with various file types and edge cases.
