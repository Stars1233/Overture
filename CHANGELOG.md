# Changelog

All notable changes to Overture will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial public release
- Interactive plan canvas with pan, zoom, and search
- Node states: pending, active, completed, failed, skipped
- Branching and decision nodes for alternative approaches
- Rich context attachment (files, documents, images)
- MCP server attachment per node
- Dynamic AI-generated input fields
- Real-time execution tracking with live status updates
- Dark mode UI with smooth animations
- Support for Claude Code, Cursor, Cline, and Sixth agents
- `get_usage_instructions` tool for automatic agent documentation
- WebSocket-based real-time communication
- Plan history and persistence
- Approval workflow with field values and branch selections

### Technical
- MCP server built with TypeScript
- React + Zustand for the UI
- ReactFlow for the canvas
- Tailwind CSS for styling
- Framer Motion for animations

## [0.1.7] - 2026-03-02

### Changed
- `submit_plan` now uses render-first success criteria: if the plan renders on canvas, the tool response is treated as success even when non-blocking XML character parse errors occur.
- Branch-node guidance messaging during `update_node_status` was refined so branch-handling responses are clearer to agents.
- Prompt files in both `prompts/` and `packages/mcp-server/prompts/` were updated with a mandatory `Consistency` section.

### Added
- Structured execution output XML support for node results, including overview and categorized sections for:
  - files changed/created/deleted
  - packages installed
  - MCP setup
  - web searches
  - tool calls
  - preview URLs
  - notes
- Rich expandable execution output UI sections for post-node inspection.
- File-attachment save endpoint for picker-based uploads that returns an absolute saved path for attachment use.

### Fixed
- Resolved confusing `submit_plan` false/error responses when plans were actually rendered successfully.
- Fixed branch requirements checklist behavior so required fields on unselected branch paths no longer block approval.
- Fixed branch flow rendering/execution by removing unnecessary empty branch selector step behavior and relying on direct branch path structure.
- Fixed execution-state sync when users manually approve in terminal/chat and the agent starts with `update_node_status` (auto-approval now keeps UI state consistent).
- Fixed node sidebar file attachment UX: replaced manual path entry flow with single-file picker flow and absolute-path attachment handling.

### Pending
- Add settings for minimum number of nodes per plan (not yet implemented).

## [0.1.0] - 2026-02-21

### Added
- Initial release of Overture MCP server
- Full plan visualization and approval workflow
- Multi-agent support (Claude Code, Cursor, Cline, Sixth)

---

## Release Notes Format

### Added
For new features.

### Changed
For changes in existing functionality.

### Deprecated
For soon-to-be removed features.

### Removed
For now removed features.

### Fixed
For any bug fixes.

### Security
In case of vulnerabilities.
