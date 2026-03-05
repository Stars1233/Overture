# Manual Test Protocol: Model/Provider Assignment

**Feature:** Plan Model/Provider Assignment
**Date:** 2026-03-04
**Tester:** Principal QA Engineer
**Status:** Ready for Manual Execution

---

## Prerequisites

1. Start Overture server:
   ```bash
   cd /Users/Opeyemi/Downloads/sixth-mcp/overture
   npm run dev
   ```

2. Verify servers running:
   - UI: http://localhost:3031
   - WebSocket: ws://localhost:3030

3. Open browser DevTools (Console + Network tabs)

---

## Test Suite

### Test 1: XML Parsing - Plan with Model/Provider

**Objective:** Verify model and provider are parsed from XML

**Steps:**
1. Submit this plan via API:
   ```bash
   curl -X POST http://localhost:3031/api/test-plan \
     -H "Content-Type: application/json" \
     -d '{
       "plan": "<plan id=\"test-model\" title=\"Test Model Assignment\" agent=\"manual-test\" model=\"claude-opus-4-20250514\" provider=\"anthropic\"><node id=\"n1\" type=\"task\"><title>Test Node</title><description>Test description</description></node><edge id=\"e1\" from=\"n1\" to=\"n2\"/><node id=\"n2\" type=\"task\"><title>Second Node</title><description>Another test</description></node></plan>"
     }'
   ```

2. Navigate to UI (http://localhost:3031)

3. Locate plan header badge

**Expected:**
- ✅ Plan appears in canvas
- ✅ Header shows badge with "claude-opus-4-20250514" text
- ✅ Badge has Cpu icon and cyan/blue styling
- ✅ Console logs: `[Overture] Plan settings updated for test-model: model=claude-opus-4-20250514, provider=anthropic`

**Result:** [ ] PASS / [ ] FAIL
**Notes:** _____________________________________

---

### Test 2: Settings Modal Opens

**Objective:** Verify clicking badge opens PlanSettingsModal

**Steps:**
1. Click on the model badge in plan header
2. Observe modal appearance

**Expected:**
- ✅ Modal opens with animation
- ✅ Header shows "Plan Settings" with Cpu icon
- ✅ Plan title displayed: "Test Model Assignment"
- ✅ Provider "Anthropic" is pre-selected (highlighted in blue)
- ✅ Model dropdown shows "claude-opus-4-20250514"
- ✅ Current Configuration summary shows both provider and model badges

**Result:** [ ] PASS / [ ] FAIL
**Notes:** _____________________________________

---

### Test 3: Provider Selection

**Objective:** Verify provider switching behavior

**Steps:**
1. Click "OpenAI" provider button
2. Observe model field changes

**Expected:**
- ✅ OpenAI button becomes highlighted (blue border)
- ✅ Anthropic button becomes unhighlighted
- ✅ Model dropdown resets (shows "Select a model...")
- ✅ Model dropdown now shows OpenAI models (gpt-4o, gpt-4o-mini, etc.)

**Repeat for each provider:**
- [ ] Google → Shows gemini models
- [ ] Mistral → Shows mistral models
- [ ] Cohere → Shows command models
- [ ] Other → Shows empty model list

**Result:** [ ] PASS / [ ] FAIL
**Notes:** _____________________________________

---

### Test 4: Model Selection from Dropdown

**Objective:** Verify predefined model selection

**Steps:**
1. Select "Anthropic" provider
2. Click model dropdown button
3. Click "claude-sonnet-4-20250514" from list

**Expected:**
- ✅ Dropdown expands with animation
- ✅ List shows all Anthropic models
- ✅ Clicking a model closes dropdown
- ✅ Selected model appears in dropdown button
- ✅ Current Configuration shows "claude-sonnet-4-20250514"

**Result:** [ ] PASS / [ ] FAIL
**Notes:** _____________________________________

---

### Test 5: Custom Model Input

**Objective:** Verify custom model entry works

**Steps:**
1. Select "OpenAI" provider
2. Type "gpt-5-custom" in custom model input field
3. Observe updates

**Expected:**
- ✅ Input field accepts text
- ✅ Current Configuration updates in real-time
- ✅ Shows "gpt-5-custom" badge in summary

**Result:** [ ] PASS / [ ] FAIL
**Notes:** _____________________________________

---

### Test 6: Save Settings

**Objective:** Verify save persists changes and syncs

**Steps:**
1. Change provider to "Google"
2. Select model "gemini-2.0-flash"
3. Click "Save Settings" button
4. Check Network tab (WebSocket frames)
5. Observe badge in plan header

**Expected:**
- ✅ Modal closes with animation
- ✅ WebSocket sends `update_plan_settings` message:
   ```json
   {
     "type": "update_plan_settings",
     "planId": "test-model",
     "model": "gemini-2.0-flash",
     "provider": "google"
   }
   ```
- ✅ WebSocket receives `plan_settings_updated` broadcast
- ✅ Plan header badge updates to "gemini-2.0-flash"
- ✅ Console logs: `[Overture] Plan settings updated: test-model`

**Result:** [ ] PASS / [ ] FAIL
**Notes:** _____________________________________

---

### Test 7: Cancel Settings

**Objective:** Verify cancel discards changes

**Steps:**
1. Click model badge to reopen modal
2. Change provider to "Mistral"
3. Select model "mistral-large"
4. Click "Cancel" button (NOT Save)
5. Reopen modal

**Expected:**
- ✅ Modal closes immediately
- ✅ NO WebSocket message sent
- ✅ Badge still shows "gemini-2.0-flash" (previous saved value)
- ✅ Reopening modal shows Google/gemini-2.0-flash (not Mistral)

**Result:** [ ] PASS / [ ] FAIL
**Notes:** _____________________________________

---

### Test 8: WebSocket Broadcast to Multiple Clients

**Objective:** Verify real-time sync across browser windows

**Steps:**
1. Open TWO browser windows to http://localhost:3031
2. In Window A: Click model badge, change to "OpenAI" / "gpt-4o", Save
3. Observe Window B (without interacting)

**Expected:**
- ✅ Window B receives WebSocket message `plan_settings_updated`
- ✅ Window B badge updates to "gpt-4o" automatically
- ✅ No page refresh required

**Result:** [ ] PASS / [ ] FAIL
**Notes:** _____________________________________

---

### Test 9: Plan Without Model/Provider

**Objective:** Verify default state when no model set

**Steps:**
1. Submit plan WITHOUT model/provider attributes:
   ```bash
   curl -X POST http://localhost:3031/api/test-plan \
     -H "Content-Type: application/json" \
     -d '{
       "plan": "<plan id=\"test-no-model\" title=\"No Model Plan\" agent=\"manual-test\"><node id=\"n1\" type=\"task\"><title>Test</title><description>Test</description></node></plan>"
     }'
   ```

2. Check plan header badge

**Expected:**
- ✅ Badge shows "Set Model" with muted styling
- ✅ Clicking opens modal with no pre-selection
- ✅ All providers unselected
- ✅ Model field disabled (shows "Select a provider first")

**Result:** [ ] PASS / [ ] FAIL
**Notes:** _____________________________________

---

### Test 10: Persistence After Page Reload

**Objective:** Verify settings persist to history storage

**Steps:**
1. Ensure a plan has model/provider set (e.g., "OpenAI" / "gpt-4o")
2. Save plan (manually trigger or wait for auto-save)
3. Refresh browser (Cmd+R / Ctrl+R)
4. Wait for plan to reload from history
5. Check badge

**Expected:**
- ✅ Plan reloads from `~/.overture/history.json`
- ✅ Badge shows "gpt-4o" (persisted value)
- ✅ Opening modal shows OpenAI / gpt-4o pre-selected

**Result:** [ ] PASS / [ ] FAIL
**Notes:** _____________________________________

---

### Test 11: Empty String Handling

**Objective:** Verify empty values convert to undefined

**Steps:**
1. Open modal
2. Select "Anthropic" provider and "claude-opus-4" model
3. Save
4. Reopen modal, clear custom model input (leave blank)
5. Save

**Expected:**
- ✅ Saving with empty model removes model from badge
- ✅ Badge shows only provider "Anthropic"
- ✅ Database stores `undefined` (not empty string)

**Result:** [ ] PASS / [ ] FAIL
**Notes:** _____________________________________

---

### Test 12: UI Responsiveness

**Objective:** Verify UI updates are smooth and responsive

**Steps:**
1. Open modal
2. Rapidly click different providers
3. Open/close model dropdown multiple times
4. Type quickly in custom model input

**Expected:**
- ✅ No UI lag or flicker
- ✅ Animations smooth (Framer Motion)
- ✅ Dropdowns open/close correctly
- ✅ No console errors

**Result:** [ ] PASS / [ ] FAIL
**Notes:** _____________________________________

---

## Summary

**Total Tests:** 12
**Passed:** ___ / 12
**Failed:** ___ / 12
**Blocked:** ___ / 12

**Critical Issues Found:**
_____________________________________

**Recommendation:**
[ ] APPROVE FOR PRODUCTION
[ ] REQUIRES FIXES
[ ] REQUIRES RE-TEST

---

**Tester Signature:** _____________________
**Date Completed:** _____________________
