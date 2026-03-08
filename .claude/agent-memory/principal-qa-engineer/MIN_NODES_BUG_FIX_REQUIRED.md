# CRITICAL BUG: Settings Not Synced on Save

**Status:** DO NOT MERGE
**Severity:** CRITICAL
**Fix Time:** 5 minutes

---

## The Problem

When a user changes the "Minimum Nodes Per Plan" setting and clicks "Save Changes":
- ✅ Setting saves to localStorage (works)
- ✅ Setting persists across page refreshes (works)
- ❌ Server is NOT notified of the change (BUG!)

**Result:** Server validation still uses the old value, making the feature non-functional.

---

## Root Cause

**File:** `/packages/ui/src/components/Modals/SettingsModal.tsx`
**Line:** 29

The `handleSave` function saves to Zustand store but doesn't call `syncSettings()` to notify the server:

```typescript
const handleSave = () => {
  setMinNodesPerPlan(localMinNodes);  // ✅ Updates localStorage
  onClose();                          // ✅ Closes modal
  // ❌ MISSING: syncSettings() to notify server
};
```

---

## The Fix

### Step 1: Import the hook
```typescript
import { useWebSocket } from '@/hooks/useWebSocket';
```

### Step 2: Get the function
```typescript
export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { minNodesPerPlan, setMinNodesPerPlan } = useSettingsStore();
  const { syncSettings } = useWebSocket();  // <-- Add this line

  // ... rest of component
}
```

### Step 3: Call it on save
```typescript
const handleSave = () => {
  setMinNodesPerPlan(localMinNodes);
  syncSettings();  // <-- Add this line
  onClose();
};
```

---

## Verify the Fix

### Check 1: Verify syncSettings is exported
**File:** `/packages/ui/src/hooks/useWebSocket.ts`

Look for this at the bottom of the hook:
```typescript
return {
  // ... other exports
  syncSettings,  // <-- Ensure this is present
};
```

If missing, add it to the return object.

### Check 2: Test the flow
1. Open UI at http://localhost:3031
2. Click gear icon (settings)
3. Change min nodes to 5
4. Click "Save Changes"
5. Open browser console
6. Look for: `[Overture] Received settings sync: { minNodesPerPlan: 5 }`
7. Check server console for: `[Overture] Settings updated: minNodesPerPlan = 5`

### Check 3: Test validation
1. Submit a 2-node plan via API or MCP tool
2. Plan should be REJECTED with message:
   "Only 2 node(s) provided, but minimum 5 node(s) required"

---

## Test Commands

```bash
# Submit 2-node plan (should fail if minNodesPerPlan >= 3)
curl -X POST http://localhost:3031/api/test-plan \
  -H "Content-Type: application/xml" \
  --data @.claude/agent-memory/principal-qa-engineer/test-min-nodes-fail.xml

# Submit 5-node plan (should always pass)
curl -X POST http://localhost:3031/api/test-plan \
  -H "Content-Type: application/xml" \
  --data @.claude/agent-memory/principal-qa-engineer/test-min-nodes-pass.xml
```

---

## Files to Modify

1. `/packages/ui/src/components/Modals/SettingsModal.tsx` (add import + call syncSettings)
2. `/packages/ui/src/hooks/useWebSocket.ts` (verify syncSettings is exported)

---

## Full Test Report

See: `/Users/Opeyemi/Downloads/sixth-mcp/overture/.claude/agent-memory/principal-qa-engineer/TEST_REPORT_MIN_NODES_SETTING.md`

---

**Once fixed, this will be a solid, well-implemented feature. The code quality is excellent, this is just a classic integration bug.**
