<div align="center">

<img src="https://raw.githubusercontent.com/SixHq/Overture/main/assets/logo.png" alt="Overture" width="140" />

# Overture

### See What Your AI Is Thinking — Before It Writes a Single Line of Code

[![npm version](https://img.shields.io/npm/v/overture-mcp?style=for-the-badge&color=00C7B7&labelColor=000000)](https://www.npmjs.com/package/overture-mcp)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge&labelColor=000000)](https://github.com/SixHq/Overture/blob/main/LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/SixHq/Overture?style=for-the-badge&color=yellow&labelColor=000000)](https://github.com/SixHq/Overture/stargazers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=for-the-badge&labelColor=000000)](https://github.com/SixHq/Overture/pulls)

<br />

**Stop flying blind with AI agents. Visualize, customize, and approve every step.**

[Quick Start](#-quick-start) · [Features](#-features) · [Demo](#-see-it-in-action) · [Docs](#-how-it-works) · [Roadmap](#-roadmap)

<br />

---

<br />

</div>

## 🎬 See It In Action

<div align="center">

<img src="https://raw.githubusercontent.com/SixHq/Overture/main/assets/demo.gif" alt="Overture Demo" width="100%" />

<br />
<br />

<img src="https://raw.githubusercontent.com/SixHq/Overture/main/assets/screenshot.png" alt="Overture Plan Canvas" width="100%" />

<sub>A completed plan in Overture — every node visible, every decision tracked, full context attached.</sub>

</div>

<br />

---

<br />

## 😤 The Problem

You know this frustration:

```
You:    "Build me a landing page with authentication"

Agent:  *silently writes 500 lines of code*

You:    "Wait... I wanted OAuth, not email/password"

Agent:  *deletes everything, starts over*
```

**Every AI coding agent today is a black box.**

- Cursor, Claude Code, Cline, Copilot — they all work the same way
- You type a prompt → agent starts coding → you pray it understood you
- By the time you see the output, it's already built the wrong thing
- Wasted tokens. Wasted time. Wasted patience.

<br />

### Why Text Plans Don't Work

Some agents show "plans" in chat. But software isn't linear:

| Text Plans | Reality |
|------------|---------|
| Step 1 → Step 2 → Step 3 | Steps branch, converge, and depend on each other |
| "Set up database" | Which database? What schema? What credentials? |
| No way to add context | You can't attach files, API keys, or docs to specific steps |
| All or nothing | Can't approve some steps while modifying others |

<br />

---

<br />

## 💡 The Solution

<div align="center">

### Overture makes the invisible visible.

</div>

<br />

Overture intercepts your AI agent's planning phase and renders it as an **interactive visual flowchart** — before any code is written.

<br />

<table>
<tr>
<td width="50%">

### Before Overture
- Hope the agent understood you
- Watch code appear line by line
- Realize it went wrong 200 lines in
- Start over

</td>
<td width="50%">

### With Overture
- See the complete plan as a graph
- Click any node for full details
- Attach files, docs, API keys per step
- Approve only what you want built

</td>
</tr>
</table>

<br />

> **Think FigJam meets AI agent planning.**

<br />

---

<br />

## 🚀 Quick Start

Get Overture running in 30 seconds. Works with **any MCP-compatible agent**.

<br />

<details open>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add overture-mcp -- npx overture-mcp
```

</details>

<details>
<summary><b>Cursor</b></summary>

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "overture": {
      "command": "npx",
      "args": ["overture-mcp"]
    }
  }
}
```

</details>

<details>
<summary><b>Cline (VS Code)</b></summary>

Add to your Cline MCP settings:

```json
{
  "mcpServers": {
    "overture": {
      "command": "npx",
      "args": ["overture-mcp"]
    }
  }
}
```

</details>

<details>
<summary><b>Global Installation</b></summary>

```bash
npm install -g overture-mcp
```

Then use `overture-mcp` instead of `npx overture-mcp` in your config.

</details>

<br />

That's it. Next time your agent plans something, Overture opens automatically at `http://localhost:3031`

<br />

---

<br />

## ✨ Features

<br />

<table>
<tr>
<td align="center" width="33%">
<br />
<h3>🗺️</h3>
<h4>Interactive Canvas</h4>
<p>Your agent's plan as a beautiful, explorable graph. Pan, zoom, search, rearrange. A living document, not a static diagram.</p>
</td>
<td align="center" width="33%">
<br />
<h3>🔀</h3>
<h4>Branching Decisions</h4>
<p>When multiple approaches exist, see them all. Compare alternatives side-by-side. Pick your path with full context.</p>
</td>
<td align="center" width="33%">
<br />
<h3>📎</h3>
<h4>Rich Context</h4>
<p>Attach files, docs, images, and API keys to specific nodes. The agent gets exactly what it needs for each step.</p>
</td>
</tr>
<tr>
<td align="center" width="33%">
<br />
<h3>🧠</h3>
<h4>Dynamic Fields</h4>
<p>AI generates the exact input fields each step needs. Database credentials, API tokens, config values — collected upfront.</p>
</td>
<td align="center" width="33%">
<br />
<h3>⚡</h3>
<h4>Live Execution</h4>
<p>Watch nodes pulse as they execute. See completions glow green. Track failures with retry options. Real-time progress.</p>
</td>
<td align="center" width="33%">
<br />
<h3>🎨</h3>
<h4>Stunning UI</h4>
<p>Dark mode. Glassmorphism. Smooth animations. Inspired by Linear, Raycast, and Vercel. You'll want to screenshot it.</p>
</td>
</tr>
</table>

<br />

---

<br />

## 🔄 How It Works

<br />

```
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   1. PROMPT                                                              │
│      ──────                                                              │
│      You give your agent a task:                                         │
│      "Build a full-stack e-commerce app with Stripe integration"         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   2. DEEP PLANNING                                                       │
│      ─────────────                                                       │
│      Agent generates a comprehensive plan — not 5 steps, but 50.         │
│      Every task broken down to its atomic level.                         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   3. VISUAL RENDERING                                                    │
│      ────────────────                                                    │
│      Overture intercepts the plan and renders it as an interactive       │
│      flowchart. Opens automatically in your browser.                     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   4. REVIEW & ENRICH                                                     │
│      ───────────────                                                     │
│      Click nodes to expand details. Attach context per step.             │
│      Select between alternative approaches. Fill in required fields.     │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│   5. APPROVE & EXECUTE                                                   │
│      ─────────────────                                                   │
│      One click to approve. Watch nodes light up as execution             │
│      progresses. Pause, modify, or rollback at any point.                │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

<br />

---

<br />

## 📊 Why Overture?

<br />

| | Visual Plan | Edit & Customize | Any Agent | Attach Context |
|:--|:--:|:--:|:--:|:--:|
| **Devin** | ❌ Text only | ⚠️ Limited | ❌ Devin only | ❌ |
| **Cline Plan Mode** | ❌ Text only | ✅ Text editing | ❌ Cline only | ❌ |
| **AgentBoard** | ⚠️ Logs only | ❌ Read-only | ⚠️ Partial | ❌ |
| **Miro / FigJam** | ✅ Manual | ✅ Full | N/A | ❌ |
| **Overture** | ✅ **Interactive graph** | ✅ **Full control** | ✅ **All MCP agents** | ✅ **Per-node** |

<br />

---

<br />

## 🛣️ Roadmap

<br />

### ✅ Shipped

- [x] Interactive plan canvas (pan, zoom, search, rearrange)
- [x] Node states — pending, active, completed, failed, skipped
- [x] Branching and decision nodes
- [x] Rich context attachment — files, docs, images, MCP servers
- [x] Dynamic AI-generated input fields
- [x] Real-time execution tracking with live status
- [x] Dark mode UI with smooth animations
- [x] Multi-agent support — Claude Code, Cursor, Cline, Sixth

<br />

### 🚧 Coming Soon

- [ ] **Parallel Execution** — Run multiple branches, pick the winner
- [ ] **Plan Templates** — Save and reuse approved plans
- [ ] **Checkpoint Rollback** — Roll back to any successful state
- [ ] **Export** — Markdown, PNG, JSON export

<br />

### 🔮 Future

- [ ] **Multiplayer** — Real-time collaborative editing
- [ ] **Approval Workflows** — Team sign-off before execution
- [ ] **Plan Analytics** — Optimize based on execution patterns
- [ ] **Community Templates** — Share and discover plans

<br />

---

<br />

## ⚙️ Configuration

<br />

| Environment Variable | Default | Description |
|---------------------|---------|-------------|
| `OVERTURE_HTTP_PORT` | `3031` | Port for the web UI |
| `OVERTURE_WS_PORT` | `3030` | Port for WebSocket communication |
| `OVERTURE_AUTO_OPEN` | `true` | Auto-open browser when server starts |

<br />

---

<br />

## 🤝 Contributing

We love contributions! Here's how you can help:

- 🐛 **Found a bug?** [Open an issue](https://github.com/SixHq/Overture/issues/new?template=bug_report.yml)
- 💡 **Have an idea?** [Request a feature](https://github.com/SixHq/Overture/issues/new?template=feature_request.yml)
- 📖 **Improve docs?** PRs welcome
- 🔧 **Write code?** Check out [good first issues](https://github.com/SixHq/Overture/labels/good%20first%20issue)

Read our [Contributing Guide](https://github.com/SixHq/Overture/blob/main/CONTRIBUTING.md) to get started.

<br />

---

<br />

## 📄 License

MIT © [Sixth](https://trysixth.com)

<br />

---

<br />

<div align="center">

### Built with ❤️ by [Sixth](https://trysixth.com)

<br />

[![Install Sixth for VS Code](https://img.shields.io/badge/VS%20Code-Install%20Sixth%20→-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=Sixth.sixth-ai)

<br />

*For the ultimate Overture experience — zero setup, embedded canvas, deeper integration.*

<br />

---

<br />

**"The best time to shape the plan is before the first line of code is written."**

<br />

[⬆ Back to top](#overture)

</div>
