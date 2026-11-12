# SPEC — Agentic OS Command Center

## Problem & audience
The owner runs 9 ventures, each with its own repo, vault folder, and Linear project. Context lives in the Agentic OS memory layer (Obsidian vault + per-repo bindings) but there is no single place to see it, act on it, or direct agents from. This app is that place: a Jarvis-grade dark mission-control web app for one user, running 24/7 on this PC, where **Claude Code is the conductor and every capability is a pressable button**.

## Success metric
The owner runs their working day from this app: reads the morning briefing, checks venture state, chats with C-suite agents, fires workflows by button, approves proposed actions, and launches Claude Code sessions — without opening the vault, Linear, or a terminal by hand.

## Operating model (from the owner's reference architecture)
- **Conductor:** headless Claude Code (`claude -p`, subscription). Every workflow run is a conductor invocation with scoped context and tools.
- **Workflow registry (data-driven core):** every capability is a registry row — name, branch, type, cadence, memory scope it touches, prompt template, integration bindings, venture-parameterized or portfolio-level. The UI renders buttons from the registry; adding a workflow is adding a row via the "add workflow" form, never code. Foundations stay fixed; capability branches are swappable.
- **Node taxonomy, color-coded:** MANUAL (gold — I press it, runs once) / SKILL (blue — reusable capability the conductor calls) / ROUTINE (green — scheduled or long-running) / AGENT (purple — spawns sub-work, persona-driven).
- **Cadence:** on-demand, scheduled (local cron), or long-running — one uniform trigger mechanism so a workflow moves between modes without rewrite.
- **Branches v1:** Memory & Productivity (foundations, CEO), Research + Content/Marketing (CMO), Finance (CFO), Ops (CTO). Registry supports adding branches (Sales, Community, ...) without core changes.

## Features — Must have (v1)
- **Portfolio dashboard (home):** all ventures at a glance — current focus (North Star), memory/decision recency, Linear task counts, unread briefings, pending approvals — plus a live status readout (active workflows, routines, integrations) and running-now indicators.
- **Workflows screen (the button grid):** conductor at top, branches as columns, workflow buttons stacked beneath — each showing name, type color, cadence icon, memory scope tag (e.g. "+ venture memory"). Buttons show idle/running/done/error state; no silent runs. "Add workflow" lives in Ops.
- **Venture tabs:** one per venture — North Star, Decisions, venture MEMORY.md, Linear tasks, recent runs. Rendered live from the vault; vault stays source of truth.
- **C-suite agent chat:** CEO, CMO, CFO, CTO — AGENT-type workflows with persistent threads, venture context injection, and save-to-memory write-back into the vault.
- **Action approval queue:** agents/workflows propose real actions (Linear issue, Gmail draft) as structured proposals; nothing executes until one-click approve; rejections record why.
- **Briefing inbox:** ROUTINE outputs land here (CEO morning briefing daily, CMO weekly review) with unread badges and history. Bounded single runs, never loops.
- **Sessions console:** MANUAL deep-work runs — launch a Claude Code session on any venture repo with a prompt, watch streaming output, review history and exit status.
- **Marketing workspace:** CMO output surface — drafts, hooks, content cascades per venture, stored in the vault under the venture folder.
- **Connectors & settings:** integration status (Linear key, Google OAuth, claude CLI), schedule editor, persona/workflow prompt editor, token-usage log per run.
- **Seed workflows (~14, all wired to real integrations):** across branches — e.g. Morning Routine/CEO briefing, Inbox Triage, Calendar Brief, Deep Research, Competitor Watch, Content Cascade, Hooks, Outlines, CFO kill-criteria check, Subs Audit, Session Spawn, Skill Creator, Vault health check. Exact set defined in the registry seed file.
- **Design bar:** Jarvis aesthetic — holographic cyan on near-black blue, gold for human commands, taxonomy colors, HUD motion. DESIGN.md + tokens govern all UI.

## Later (explicitly deferred)
- Vault explorer screen (file tree, wikilink browser, force-directed link graph, dashboard mini-graph) — descoped 2026-07-08: graph physics proved glitchy in design; owner saved the design to revisit. No code existed when descoped.
- Remote access via tunnel; VPS deploy (build stays Docker-portable).
- Autonomous no-approval actions.
- Seeding the 5 remaining ventures; new `Businesses/` folders and registry rows must appear without code changes.
- Additional integrations from the reference (Slack, Make, NotebookLM, LightRAG, GWS CLI) — registry supports them; none wired in v1.
- Additional branches (Sales, Community, Agency) — registry supports; seeded when a real workflow needs them.

## Out of scope
- Multi-user/auth/client tenancy — localhost, one user.
- A database as source of truth for venture knowledge — the vault owns it; SQLite holds app state only (registry, threads, queue, briefings, runs, settings).
- Raw Anthropic API billing — subscription headless Claude only.
- Mobile optimization; editing North Star/Decisions from the UI (read-only v1).
- Restructuring the vault to the reference's /raw//wiki layout — the existing vault structure is authoritative.

## Acceptance criteria — done means
1. Dashboard shows all 4 live ventures with real North Star focus lines, real Linear counts, real memory recency — verified by hand against vault and Linear.
2. Pressing a workflow button fires a real conductor run with visible running/done/error state and a reviewable output; the status readout reflects it live.
3. Each of the 4 agents answers a venture-specific question using facts only in that venture's vault folder, and save-to-memory lands a dated entry in the right `Businesses/<venture>/Memory/MEMORY.md`.
4. An agent-proposed Linear issue does nothing until approved, then actually appears in Linear; a Gmail draft proposal lands as a real Gmail draft after approval.
5. The CEO morning briefing arrives in the inbox on schedule with zero interaction, covering all live ventures.
6. A custom workflow created via "add workflow" renders as a working button and runs — no code change.
7. A session launched from the console streams output live; full log reviewable after exit.
8. The app survives a PC reboot: comes back up automatically, schedules still fire.

## Edge cases & constraints
- Vault on `/mnt/c` (9P fs): mtime-cached reads; never a second copy of truth.
- Headless `claude -p` pitfalls documented in memory `reference_linear_mcp_headless.md`; Linear via GraphQL API key, not MCP.
- Google OAuth (Gmail read/drafts, Calendar read) is a one-time human setup — logged to human-actions; dependent workflows show "not configured" until done.
- claude.ai connectors are unavailable headless — workflows get context via the app's own integrations.
- Two writers, one vault (terminal sessions + app): append-only dated entries, newest first.
- PII never enters the vault — enforced in every workflow/persona prompt.
- WSL2 boot-start via Windows Task Scheduler → wsl.exe.
