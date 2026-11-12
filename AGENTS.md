<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agentic OS Command Center

Jarvis-grade dark mission-control web app for the owner (solo operator, 9 ventures): a data-driven workflow registry rendered as pressable buttons, portfolio dashboard, C-suite agent chat (CEO/CMO/CFO/CTO), action approval queue, briefing inbox, and a Claude Code session console — the UI on top of the existing vault + Linear memory layer, with headless Claude Code as the conductor.

## Living spec
SPEC.md is the source of truth. Before any change that deviates from SPEC.md, stop and flag OFF-PLAN. Build via /build.

## Stack
- Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui, App Router, `output: standalone`
- SQLite (better-sqlite3) at `data/app.db` — app state ONLY (registry, threads, queue, briefings, runs, settings)
- Vault at `$VAULT_ROOT/` — source of truth for all venture knowledge; direct fs reads, mtime cache
- Linear GraphQL API via `LINEAR_API_KEY` (not MCP); Google APIs via OAuth (Gmail read/drafts, Calendar read)
- Conductor: spawn `claude -p --output-format stream-json` on the subscription; SSE to browser
- Scheduler: node-cron from `instrumentation.ts`; one process total

## Approval gates — stop and ask before
1. SQLite schema changes after Phase 3
2. Deleting any file or data (app, vault, or Linear)
3. Anything outward-facing: real Linear/Gmail writes during testing, deploys, tunnels
Everything else: proceed without asking.

## Conventions
- Vault writes are append-only dated entries (`- YYYY-MM-DD — ...`), newest first; never rewrite existing lines — terminal sessions write the same files.
- Ventures are discovered from `Businesses/*/` at runtime — never hardcode the venture list.
- Workflows are registry rows (SQLite, seeded from `data/workflows.seed.json`) — never hardcode a workflow button; UI, scheduler, and runner all consume the registry through the one conductor runner.
- PII never enters the vault; every workflow/persona prompt must state this.
- DESIGN.md + design/tokens.json govern all UI — no default Tailwind palette, no arbitrary values, no unstyled placeholder states.
- Headless `claude -p` gotchas live in memory `reference_linear_mcp_headless.md` — read before touching the runner.

## Out of scope (refuse without asking)
Multi-user/auth, DB as knowledge source of truth, raw API billing, mobile optimization, editing North Star/Decisions from the UI, remote tunnel, VPS deploy, autonomous no-approval actions, vault restructuring.
