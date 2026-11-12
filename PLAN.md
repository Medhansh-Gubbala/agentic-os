# PLAN — Agentic OS Command Center

## Stack
- **Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui** — one app, App Router, `output: standalone` for Docker portability.
- **SQLite via better-sqlite3** at `data/app.db` — app state only: workflow registry, runs, chat threads/messages, action queue, briefings, settings.
- **Workflow registry** is the core: seeded from `data/workflows.seed.json` into SQLite; UI, scheduler, and runner all consume registry rows. Buttons are data-driven, never hardcoded.
- **Conductor runner:** one module spawning `claude -p --output-format stream-json` (subscription) with per-workflow prompt template, context injection (vault + Linear), scoped `--allowedTools`, cwd per venture/vault. All four trigger modes (button, cron, agent-chat, long-running) call this same runner.
- **Vault access:** direct fs reads of `$VAULT_ROOT/` with mtime cache; append-only dated writes.
- **Linear:** GraphQL API via `LINEAR_API_KEY`. **Google:** Gmail (read + drafts) and Calendar (read) via OAuth — one-time human setup.
- **Scheduler:** node-cron from `instrumentation.ts`, firing registry ROUTINE rows. One process total.
- **Boot persistence:** Windows Task Scheduler → `wsl.exe` → pm2. Dockerfile written; Docker optional for v1.

## Build phases (each ends viewable)
1. **Design system + skeleton.** DESIGN.md + tokens (Jarvis direction, owner-approved), scaffold, shell + nav renders per DESIGN.md.
2. **Vault + Linear read layer.** Parsers + Linear client → portfolio dashboard + venture tabs with real data. (Acceptance 1)
3. **Registry + conductor runner.** Schema, seed file, runner spike, workflows button grid with live run states, status readout. (Acceptance 2, 6)
4. **Agent chat.** AGENT rows: personas, threads, SSE streaming, save-to-memory write-back. (Acceptance 3)
5. **Action queue.** Proposal schema, queue UI, Linear + Gmail executors. (Acceptance 4)
6. **Scheduler + briefing inbox.** Cron firing ROUTINE rows; CEO daily + CMO weekly land in inbox. (Acceptance 5)
7. **Sessions console.** MANUAL deep-work runs on venture repos, streaming + history. (Acceptance 7)
8. **Marketing workspace + settings.** CMO surface → vault; connectors status, schedule editor, prompt editor, usage log.
9. **24/7 + polish.** Boot-start, reboot test, Dockerfile, full design pass, remaining seed workflows verified. (Acceptance 8)

## Approval gates — agent MUST stop and ask before
1. SQLite schema changes after Phase 3 (migrations touch live data).
2. Deleting any file or data (app, vault, or Linear).
3. Anything outward-facing: real Linear/Gmail writes during testing, deploys, tunnels.
Everything else proceeds without asking.

## Risks / open questions
- **Headless `claude -p`** (auth, stdin, permissions) is the load-bearing unknown — Phase 3 opens with a spike proving persona + vault read + structured output before UI builds on it. Known pitfalls: memory `reference_linear_mcp_headless.md`.
- **Subscription rate limits:** all workflows share one subscription; per-run usage log exists to see it; schedules thin out first if limits bite.
- **Google OAuth** is human-only setup (cloud console + consent). Dependent workflows ship behind "not configured" state.
- **/mnt/c fs speed:** mtime cache should cover; if not, move the app itself (never the vault) into WSL fs.
- **Two writers, one vault:** append-only discipline; a conflict means a design fix.
- **Registry generality vs. YAGNI:** the registry stores prompt templates + bindings, not a visual workflow builder. If a seed workflow needs bespoke code, it gets a named runner variant, not a plugin system.
