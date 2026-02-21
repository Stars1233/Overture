<p align="center">
  <img src="https://raw.githubusercontent.com/SixHq/Overture/main/assets/logo.png" alt="Overture Logo" width="120" />
</p>

<h1 align="center">Overture</h1>

<p align="center">
  <strong>See what your AI is thinking — before it writes a single line of code.</strong>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/overture-mcp"><img src="https://img.shields.io/npm/v/overture-mcp.svg?style=flat-square&color=00C7B7" alt="npm version" /></a>
  <a href="https://github.com/SixHq/Overture/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square" alt="license" /></a>
  <a href="https://github.com/SixHq/Overture/stargazers"><img src="https://img.shields.io/github/stars/SixHq/Overture?style=flat-square&color=yellow" alt="stars" /></a>
  <a href="https://github.com/SixHq/Overture/issues"><img src="https://img.shields.io/github/issues/SixHq/Overture?style=flat-square" alt="issues" /></a>
</p>

<p align="center">
  <a href="#-the-problem">Problem</a> •
  <a href="#-the-solution">Solution</a> •
  <a href="#-features">Features</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-how-it-works">How It Works</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

<br />

<p align="center">
  <img src="https://raw.githubusercontent.com/SixHq/Overture/main/assets/demo.gif" alt="Overture Demo" width="800" />
</p>

<br />

---

<br />

## 🎯 The Problem

Every AI coding agent today — **Cursor, Claude Code, Cline, Copilot** — shares the same fundamental flaw:

> You type a prompt. The agent starts working. You have **zero visibility** into what it plans to do until code starts appearing.

By the time you realize the agent went in the wrong direction, it has already written **200+ lines of code** you need to throw away.

### The Black Box Problem
```
You: "Build me a landing page with auth"
Agent: *writes 500 lines*
You: "Wait, I wanted OAuth, not email/password..."
Agent: *deletes everything, starts over*
💸 Tokens wasted. ⏰ Time lost. 😤 Frustration mounting.
```

### The Chat Log Problem
Some agents show plans as text. But text plans are **fundamentally broken** for complex projects:
- Plans branch, converge, and have dependencies — text is linear
- No way to attach context (files, API keys, docs) to specific steps
- Can't explore alternatives without rewriting everything

<br />

## 💡 The Solution

**Overture makes the invisible visible.**

It's a visual canvas that intercepts your AI agent's planning phase and renders it as an **interactive, editable flowchart** — before any code is written.

<p align="center">
  <img src="https://firebasestorage.googleapis.com/v0/b/sixth-v2.appspot.com/o/Screenshot%202026-02-21%20at%207.37.40%E2%80%AFAM.png?alt=media&token=13b29c30-dd91-4f26-bd35-0b87b5d23b6d" alt="Overture Canvas" width="800" />
</p>

**Think FigJam meets AI agent planning.**

You see every step. You approve the approach. You attach context. You watch it execute in real-time. You stay in control.

<br />

## ✨ Features

### 🗺️ Interactive Plan Canvas
Your agent's plan rendered as a beautiful, explorable graph. Pan, zoom, search, rearrange. Not a static diagram — a living document.

### 🔀 Branching & Decision Nodes
When multiple approaches exist, see them all. Compare "Use Stripe Checkout" vs "Use Stripe Elements" vs "Use LemonSqueezy" — then pick your path.

### 📎 Rich Context Attachment
Drag files, docs, images, and API keys directly onto nodes. The agent gets exactly what it needs for each step — no more mid-execution "what's your API key?" interruptions.

### 🧠 Dynamic AI-Generated Fields
The agent analyzes each step and generates the exact input fields needed. Database node? Here's a field for your connection string. Deployment node? Here's where your Vercel token goes.

### ⚡ Real-Time Execution Tracking
Watch your plan come to life:
- **Active nodes** pulse with progress
- **Completed nodes** glow green
- **Failed nodes** show errors with retry options
- Live logs stream at the bottom

### 🎨 Stunning Dark UI
We didn't build "another Mermaid diagram renderer." We built something you'll want to screenshot and share. Glassmorphism, neon accents, smooth animations — inspired by Linear, Raycast, and Vercel.

<br />

## 📦 Installation

Overture works with **any MCP-compatible AI coding agent**. One command to install, zero configuration required.

### Claude Code
```bash
claude mcp add overture-mcp -- npx overture-mcp
```

### Cursor
Add to your MCP configuration (`~/.cursor/mcp.json`):
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

### Cline (VS Code)
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

### Global Installation
```bash
npm install -g overture-mcp
```
Then use `overture-mcp` directly instead of `npx overture-mcp`.

<br />

## 🔄 How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  1. PROMPT                                                      │
│     You give your agent a task                                  │
│     "Build a full-stack e-commerce app with Stripe"             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. PLAN GENERATION                                             │
│     Agent generates a deep, structured plan                     │
│     Every task broken down to atomic steps                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. VISUAL RENDERING                                            │
│     Overture renders the plan as an interactive graph           │
│     Opens automatically in your browser                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. REVIEW & ENRICH                                             │
│     Click nodes to expand details                               │
│     Attach files, docs, API keys to specific steps              │
│     Select between alternative approaches                       │
│     Fill in AI-generated dynamic fields                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. APPROVE & EXECUTE                                           │
│     Hit approve when you're ready                               │
│     Watch nodes light up as execution progresses                │
│     Pause, retry, or rollback at any point                      │
└─────────────────────────────────────────────────────────────────┘
```

<br />

## 📊 Comparison

| Tool | Visual Plan | Interactive Editing | Agent Agnostic | Context Attachment |
|------|:-----------:|:-------------------:|:--------------:|:------------------:|
| Devin 2.0 | ❌ Text-based | Limited | ❌ Devin only | ❌ |
| Cline Plan Mode | ❌ Text-based | ✅ Text only | ❌ Cline only | ❌ |
| AgentBoard | ⚠️ Logging only | ❌ Read-only | ⚠️ Partial | ❌ |
| Miro/FigJam | ✅ Manual | ✅ Full | N/A | ❌ |
| **Overture** | ✅ **Interactive** | ✅ **Full** | ✅ **All agents** | ✅ **Per-node** |

<br />

## 🛣️ Roadmap

### ✅ Shipped
- Interactive plan canvas with pan, zoom, search
- Node states (pending, active, completed, failed)
- Branching and decision nodes
- Rich context attachment (files, docs, MCP servers)
- Dynamic AI-generated input fields
- Real-time execution tracking
- Dark mode UI with animations

### 🚧 Coming Soon
- **Parallel Execution** — Run multiple branches simultaneously, pick the winner
- **Plan Templates** — Save and reuse approved plans
- **Checkpoint Rollback** — Roll back to any successful state
- **Export** — Markdown, PNG, JSON export of plans

### 🔮 Future
- **Multiplayer Collaboration** — Real-time team editing like FigJam
- **Approval Workflows** — Require sign-off before execution
- **Plan Analytics** — Track execution patterns and optimize
- **Community Templates** — Share and discover plan templates

<br />

## 🔧 Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OVERTURE_HTTP_PORT` | `3031` | HTTP server port for the UI |
| `OVERTURE_WS_PORT` | `3030` | WebSocket server port |
| `OVERTURE_AUTO_OPEN` | `true` | Auto-open browser on start |

<br />

## 🤝 Contributing

We welcome contributions! Whether it's:
- 🐛 Bug reports
- 💡 Feature requests
- 📖 Documentation improvements
- 🔧 Code contributions

Check out our [issues page](https://github.com/SixHq/Overture/issues) to get started.

<br />

## 📄 License

MIT © [Sixth](https://trysixth.com)

<br />

---

<p align="center">
  <strong>Built with ❤️ by <a href="https://trysixth.com">Sixth</a></strong>
</p>

<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=Sixth.sixth-ai">
    <img src="https://img.shields.io/badge/VS%20Code-Install%20Sixth-007ACC?style=for-the-badge&logo=visualstudiocode" alt="Install Sixth" />
  </a>
</p>

<p align="center">
  <sub>For the ultimate Overture experience, try <a href="https://marketplace.visualstudio.com/items?itemName=Sixth.sixth-ai">Sixth for VS Code</a> — zero setup, embedded canvas, deeper integration.</sub>
</p>

<br />

<p align="center">
  <i>"The best time to shape the plan is before the first line of code is written."</i>
</p>
