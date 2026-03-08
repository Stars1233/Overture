# Overture MCP Server - Agent Memory

## Project Structure
- Monorepo with two packages: `packages/mcp-server` (Node.js/TypeScript) and `packages/ui` (React)
- MCP server entry point: `packages/mcp-server/src/index.ts`
- Tool handlers: `packages/mcp-server/src/tools/handlers.ts`
- Types: `packages/mcp-server/src/types.ts`
- UI WebSocket handler: `packages/ui/src/hooks/useWebSocket.ts`

## Adding New MCP Tools - Pattern
1. **types.ts** - Add new WSMessage type if tool broadcasts to UI
2. **handlers.ts** - Implement handler function with proper signature
3. **index.ts** - Add:
   - Import the handler function
   - Zod schema for validation
   - Tool definition in TOOLS array
   - Case in switch statement to call handler
4. **useWebSocket.ts** (UI) - Add:
   - MessageType union member
   - Case in handleMessage switch for UI updates

## Key Patterns
- `projectId` is derived from workspace path hash (first 12 chars of SHA256)
- `multiProjectPlanStore` manages state for multiple projects
- `wsManager.broadcastToProject()` sends WebSocket messages to UI
- All handlers return `{ success: boolean, message: string, projectId?: string }`
- Use `currentProjectId` as fallback when `projectId` not provided

## Build Commands
- Full build: `npm run build` (from root, but workspaces may need direct cd)
- Server build: `cd packages/mcp-server && npm run build`
- UI build: `cd packages/ui && npm run build`
- Dev mode: `npm run dev` (runs both)

## Known Issues (as of 2026-03-04)
- UI has pre-existing TypeScript errors in `ContextMenu.tsx`, `PlanCanvas.tsx` (unused variables)
- Missing `date-fns` module declaration in `HistoryPanel.tsx`
- These are unrelated to MCP tool implementation work

## Monaco Editor Integration (Updated 2026-03-05)
- Package: `@monaco-editor/react` in `packages/ui`
- Key files: `StructuredOutputView.tsx`, `MonacoViewerModal.tsx`, `OutputModal.tsx`
- Custom theme `overture-dark` matches app colors
- Language detection via `getLanguageFromFilename()` - maps 50+ extensions

### File Reading from Disk (Added 2026-03-05)
Eye icon on file items now reads files from disk if content not embedded in structured output.

**Server Endpoint:** `POST /api/read-file`
- Location: `packages/mcp-server/src/http/server.ts`
- Request: `{ filePath: string }` (absolute path)
- Response: `{ content, lineCount, size, lastModified }`

**UI Flow:**
1. `NodeDetailPanel` gets `workspacePath` from `useMultiProjectStore().tabs`
2. Passes `workspacePath` to `OutputModal`
3. On click, constructs full path: `${workspacePath}/${relativePath}`
4. Fetches content via `/api/read-file` API
5. Opens `MonacoViewerModal` with fetched content

**Files Modified:**
- `packages/mcp-server/src/http/server.ts` - Added `/api/read-file` endpoint
- `packages/ui/src/components/Modals/OutputModal.tsx` - Added `workspacePath` prop, file fetching
- `packages/ui/src/components/Panel/StructuredOutputView.tsx` - Same changes
- `packages/ui/src/components/Panel/NodeDetailPanel.tsx` - Pass `workspacePath` to OutputModal

## UI Store Patterns
- `usePlanStore.updateNode(id, updates)` applies partial updates via spread: `{ ...n, ...updates }`
- `multiProjectStore.updateProjectNode(projectId, nodeId, updates)` mirrors the same pattern
- Both stores should be updated for consistency between legacy and multi-project modes

## Requirements Checklist Components
- `RequirementsChecklist.tsx` - Simple version showing all fields as list items
- `RequirementsChecklistV2.tsx` - Expanded version with inline field editing

### Common Bug: Field Filtering (Fixed 2026-03-04)
The components had a bug where optional fields were filtered out.

**Wrong pattern:**
```typescript
.filter(req => req.fields.some(f => f.required) || req.isBranchPoint);
```

**Correct pattern:**
```typescript
.filter(req => req.fields.length > 0 || req.isBranchPoint);
```

### Progress Calculation
- Only required items count toward "ready to approve" status
- Display shows all items (required + optional) for user context
- Optional fields show with "(optional)" label and lighter styling

## Adding New Field Types (Pattern from color field addition 2026-03-04)
When adding a new dynamic field type (like `color`, `file`, etc.):

1. **Update type definitions** (both must be kept in sync):
   - `packages/mcp-server/src/types.ts` - Add to `FieldType` union
   - `packages/ui/src/stores/plan-store.ts` - Add to `FieldType` union

2. **Add UI rendering**:
   - `packages/ui/src/components/Panel/DynamicFieldInput.tsx` - Add case in switch

3. **Update ALL 6 prompt files** in `packages/mcp-server/prompts/`:
   - `overture-instructions.md` - Base instructions
   - `claude-code.md`, `cline.md`, `cursor.md`, `gh_copilot.md`, `sixth.md`
   - Update type attribute in XML examples
   - Update "Dynamic Field Types" table
   - Add usage examples if applicable

4. **XML parser already handles generic attributes** - no changes needed in:
   - `packages/mcp-server/src/parser/xml-parser.ts`

## Per-Project Storage (Added 2026-03-04)

### Architecture
- **Global Storage**: `~/.overture/history.json` - stores all plans globally
- **Project Storage**: `.overture.json` in project folder - stores project-specific history
- Project storage takes priority, falls back to global if write denied or no workspace path

### Key Files
- `storage/project-storage.ts` - `ProjectStorage` class and `projectStorageRegistry`
- `store/plan-store.ts` - `getProjectStorage()` method determines which storage to use

### ProjectConfig Structure
```typescript
interface ProjectConfig {
  version: 1;
  projectId: string;
  history: PersistedPlan[];  // Array of full plan data
  settings?: {
    minNodesPerPlan?: number;
    defaultModel?: string;
    defaultProvider?: string;
  };
}
```

### Integration Points
- `persistToHistory()` - saves to project storage if available, else global
- `restoreProjectFromHistory()` - checks both storages, project first
- `getProjectHistory()` - combines entries from both storages
- Auto-save (every 3s) uses same priority logic

## Help Modal Implementation (Added 2026-03-04)

### Files Created/Modified
- `packages/ui/src/data/help-content.ts` - Documentation content data
- `packages/ui/src/components/Modals/HelpModal.tsx` - Modal component
- `packages/ui/src/components/Layout/Header.tsx` - Added HelpCircle button

### Data Structure
```typescript
interface HelpSection {
  id: string;
  title: string;
  content: string;  // Markdown-like content
}

interface HelpCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  sections: HelpSection[];
}
```

### Features
- Full-screen modal with sidebar category navigation
- Search across all content via `getSearchableContent()`
- Markdown-like rendering: bold, inline code, tables, lists, code blocks
- Keyboard shortcut: `?` key opens help modal
- 8 categories: Getting Started, Plan Workflow, Node Operations, Branch Selection, Dynamic Fields, MCP Servers, Troubleshooting, Keyboard Shortcuts

### Modal Patterns Used
- `createPortal(jsx, document.body)` for z-index isolation
- `AnimatePresence` + `motion.div` for enter/exit animations
- `clsx` for conditional class names
- Icons from `lucide-react` (HelpCircle, Search, ChevronRight, etc.)

## Plan Model/Provider Assignment (Added 2026-03-04)

### Feature Overview
Users can assign specific AI models and providers to plans. The model/provider can be:
1. Set via XML attributes: `<plan model="claude-sonnet-4-20250514" provider="anthropic">`
2. Changed via UI using the PlanSettingsModal

### Files Modified
- `packages/mcp-server/src/types.ts` - Added `model?: string`, `provider?: string` to `Plan` interface
- `packages/mcp-server/src/parser/xml-parser.ts` - Extract model/provider from plan tag
- `packages/mcp-server/src/store/plan-store.ts` - Added `updatePlanSettings()` method
- `packages/mcp-server/src/websocket/ws-server.ts` - Handle `update_plan_settings` message
- `packages/ui/src/stores/plan-store.ts` - Added model/provider to Plan, added `updatePlanSettings`
- `packages/ui/src/stores/multi-project-store.ts` - Added `updateProjectPlanSettings()`
- `packages/ui/src/hooks/useWebSocket.ts` - Handler for `plan_settings_updated` message
- `packages/ui/src/components/Canvas/PlanCanvas.tsx` - Model badge in header, settings modal state
- `packages/ui/src/components/Modals/PlanSettingsModal.tsx` - New modal for editing settings
- `packages/mcp-server/prompts/overture-instructions.md` - Documented XML attributes

### WebSocket Message Types
- Client->Server: `update_plan_settings { planId, model?, provider?, projectId? }`
- Server->Client: `plan_settings_updated { planId, model?, provider?, projectId? }`

### Supported Providers
- anthropic, openai, google, mistral, cohere, other

### UI Components
- Model badge in PlanHeader (shows model name, clickable to open settings)
- PlanSettingsModal with provider grid and model dropdown/custom input

## Workspace Path Support (Added 2026-03-05)

### Overview
All MCP tools now accept an optional `workspace_path` parameter for project-local storage support.
This allows plans to be stored in `.overture.json` files within each project folder.

### Files Modified
- `packages/mcp-server/src/index.ts` - Added `workspace_path` to all Zod schemas and tool inputSchemas
- `packages/mcp-server/src/tools/handlers.ts` - Updated all handler signatures with `workspacePath?: string`
- `packages/mcp-server/src/types.ts` - Added `workspacePath` to `get_history` and `load_plan` message types
- `packages/mcp-server/src/websocket/ws-server.ts` - Use project storage when loading/saving with workspace path
- `packages/mcp-server/src/store/plan-store.ts` - Added `loadFromPersistedPlan()` method
- `packages/ui/src/hooks/useWebSocket.ts` - Updated `getHistory()` and `loadPlan()` to accept workspace path
- `packages/ui/src/components/Panel/HistoryPanel.tsx` - Pass workspace path when loading plans

### Pattern for Adding workspace_path to MCP Tools
1. Add `workspace_path` to Zod schema in `index.ts`
2. Add `workspace_path` to tool inputSchema JSON in `index.ts`
3. Update handler call to pass `workspacePath` in `index.ts`
4. Update handler function signature to accept `workspacePath?: string` in `handlers.ts`
5. Include `workspacePath` in return object from handler

### WebSocket History Flow with Workspace Path
1. UI sends `get_history` with `projectId` and `workspacePath`
2. Server uses `projectStorageRegistry.getStorage()` to get project storage
3. Merges entries from project storage and global storage
4. Returns deduplicated entries sorted by date
