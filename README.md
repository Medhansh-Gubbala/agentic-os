# Agentic OS: Command Center

A local, always-on mission-control web app for running several software projects at once by directing AI agents. Headless [Claude Code](https://docs.anthropic.com/en/docs/claude-code) is the "conductor": every capability is a row in a data-driven workflow registry, rendered as a button. Press it, and the app spawns a scoped agent run, streams its output live, and routes anything with real-world side effects through a human approval queue.

Built for one user (me), running 24/7 on my own machine under pm2.

## What it does

| Screen | What happens there |
|---|---|
| **Dashboard** | Every project at a glance: current focus, decision recency, Linear task counts, unread briefings, pending approvals, live run indicators |
| **Workflows** | The button grid. 25 seed workflows across branches (Memory, Research/Marketing, Finance, Ops). Each button shows type, cadence, memory scope and live state. New workflows are added from a form, no code change |
| **Agents** | Persistent chat threads with four persona agents (CEO, CFO, CMO, CTO), each grounded in the project's notes, with save-to-memory write-back |
| **Queue** | Agents *propose* actions (a Linear issue, a Gmail draft) as structured JSON. Nothing executes until one-click approval; rejections record a reason |
| **Inbox** | Scheduled routines (morning briefing, weekly marketing review) land here with unread badges |
| **Sessions** | Launch a Claude Code session against any project repo and watch it stream; history keeps exit status |
| **Ventures / Marketing / Settings** | Per-project tabs rendered live from the notes vault, a marketing drafts workspace, connector status, schedule and persona-prompt editors, and a per-run token-usage log |

## Architecture

```
Browser (Next.js 16 App Router, React 19)
   │  fetch + Server-Sent Events (live run output)
   ▼
Next.js route handlers (26 API routes)
   ├── SQLite (better-sqlite3)       app state only: registry, runs, threads, queue, briefings, settings
   ├── Conductor                     spawns `claude -p --output-format stream-json` per run,
   │                                 parses the event stream, persists logs, fans out over SSE
   ├── Scheduler (node-cron)         ROUTINE workflows on cron schedules, one trigger path for all cadences
   ├── Executors                     approved proposals → Linear GraphQL API / Gmail
   └── Vault reader                  Markdown notes folder = source of truth for project knowledge (mtime-cached)
```

Design choices worth calling out:

- **Data-driven registry.** A workflow is a row (prompt template, allowed tools, cadence, memory scope, required integrations), not code. The seed file is insert-only on boot so edits made in Settings are never overwritten.
- **Human-in-the-loop by construction.** Agents can only emit proposals; the executor runs only after approval. Workflows that need an integration that isn't connected return `412` with the reason instead of failing silently; a second run of a busy workflow returns `409`.
- **No silent failures.** The conductor listens for the child process `error` event (a missing binary fires `error` without `close`), so a run can never sit at "running" with an empty log.
- **Single source of truth.** Project knowledge stays in plain Markdown; the database never holds a second copy.
- **Design system.** `DESIGN.md` + `design/tokens.json` drive Tailwind v4 theme tokens and a 20-component `src/components/ds/` library; an ESLint rule (`design/eslint-anti-slop.js`) fails the build on off-palette utility classes.

## Stack

TypeScript · Next.js 16 · React 19 · Tailwind CSS v4 · shadcn/ui + Radix · SQLite (better-sqlite3) · node-cron · Server-Sent Events · Claude Code CLI (headless) · Linear GraphQL API · Docker · pm2

## Running it

Requirements: Node 22+, and the [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) on `PATH`, signed in.

```bash
npm ci
cp .env.example .env.local   # then fill in what you use; every integration is optional
npm run dev                   # http://localhost:3000
```

Point `VAULT_ROOT` at a folder of Markdown notes with one subfolder per project (`North Star.md`, `Decisions.md`, `Memory/MEMORY.md`). The repo map for the Sessions console comes from `VENTURE_REPOS`. A `Dockerfile` is included for a portable build.

## How it was built

I designed the product, wrote the spec (`SPEC.md`, `PLAN.md`), and directed the build: I used Claude Code as the implementation workforce (a lead model orchestrating and verifying, worker models building in parallel), reviewed every phase, and verified each acceptance criterion against the running app. `SPEC.md` and `PLAN.md` are the actual planning documents; the project names in the design mockups (`design/reference/`) are placeholders.

## License

MIT, see [LICENSE](LICENSE).
