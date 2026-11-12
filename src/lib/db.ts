import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

// next build evaluates every route in parallel workers; they would race to create
// and WAL-switch the same fresh file (SQLITE_BUSY). The build needs no real data.
const DB_PATH =
  process.env.NEXT_PHASE === "phase-production-build"
    ? ":memory:"
    : (process.env.APP_DB_PATH ?? path.join(process.cwd(), "data", "app.db"));

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS workflows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  branch TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('manual','skill','routine','agent')),
  cadence TEXT NOT NULL CHECK(cadence IN ('on_demand','scheduled','long_running')),
  schedule_cron TEXT,
  scope TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'claude-sonnet-5',
  allowed_tools TEXT NOT NULL DEFAULT '["Read","Grep","Glob"]',
  cwd_mode TEXT NOT NULL DEFAULT 'vault' CHECK(cwd_mode IN ('vault','venture_repo','project')),
  takes_venture INTEGER NOT NULL DEFAULT 0,
  requires TEXT NOT NULL DEFAULT '[]',
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER REFERENCES workflows(id),
  kind TEXT NOT NULL DEFAULT 'workflow' CHECK(kind IN ('workflow','chat','session')),
  venture TEXT,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running' CHECK(status IN ('running','done','error','killed')),
  started_at TEXT NOT NULL,
  finished_at TEXT,
  exit_code INTEGER,
  result TEXT,
  log TEXT NOT NULL DEFAULT '',
  session_id TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost_usd REAL,
  duration_ms INTEGER
);

CREATE TABLE IF NOT EXISTS threads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent TEXT NOT NULL,
  venture TEXT,
  title TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  thread_id INTEGER NOT NULL REFERENCES threads(id),
  role TEXT NOT NULL CHECK(role IN ('user','agent')),
  content TEXT NOT NULL,
  run_id INTEGER REFERENCES runs(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER REFERENCES runs(id),
  agent TEXT,
  venture TEXT,
  kind TEXT NOT NULL CHECK(kind IN ('linear_issue','gmail_draft')),
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','executed','failed')),
  reason TEXT,
  result TEXT,
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS briefings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workflow_id INTEGER REFERENCES workflows(id),
  run_id INTEGER REFERENCES runs(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  unread INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`);

// ---------- workflows ----------

export type WorkflowRow = {
  id: number;
  slug: string;
  name: string;
  branch: string;
  type: "manual" | "skill" | "routine" | "agent";
  cadence: "on_demand" | "scheduled" | "long_running";
  schedule_cron: string | null;
  scope: string;
  prompt: string;
  model: string;
  allowed_tools: string; // JSON-encoded array
  cwd_mode: "vault" | "venture_repo" | "project";
  takes_venture: number; // 0 | 1
  requires: string; // JSON-encoded array
  enabled: number; // 0 | 1
  created_at: string;
  updated_at: string;
};

export type WorkflowInput = Omit<WorkflowRow, "id" | "created_at" | "updated_at">;

export function listWorkflows(): WorkflowRow[] {
  return db.prepare(`SELECT * FROM workflows ORDER BY name`).all() as WorkflowRow[];
}

export function getWorkflow(slug: string): WorkflowRow | undefined {
  return db.prepare(`SELECT * FROM workflows WHERE slug = ?`).get(slug) as
    | WorkflowRow
    | undefined;
}

export function upsertWorkflow(w: WorkflowInput): WorkflowRow {
  const now = new Date().toISOString();
  const existing = getWorkflow(w.slug);
  if (existing) {
    db.prepare(
      `UPDATE workflows SET name=?, branch=?, type=?, cadence=?, schedule_cron=?, scope=?,
       prompt=?, model=?, allowed_tools=?, cwd_mode=?, takes_venture=?, requires=?, enabled=?,
       updated_at=? WHERE slug=?`,
    ).run(
      w.name,
      w.branch,
      w.type,
      w.cadence,
      w.schedule_cron,
      w.scope,
      w.prompt,
      w.model,
      w.allowed_tools,
      w.cwd_mode,
      w.takes_venture,
      w.requires,
      w.enabled,
      now,
      w.slug,
    );
  } else {
    db.prepare(
      `INSERT INTO workflows (slug, name, branch, type, cadence, schedule_cron, scope, prompt,
       model, allowed_tools, cwd_mode, takes_venture, requires, enabled, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).run(
      w.slug,
      w.name,
      w.branch,
      w.type,
      w.cadence,
      w.schedule_cron,
      w.scope,
      w.prompt,
      w.model,
      w.allowed_tools,
      w.cwd_mode,
      w.takes_venture,
      w.requires,
      w.enabled,
      now,
      now,
    );
  }
  return getWorkflow(w.slug)!;
}

export function setWorkflowEnabled(slug: string, enabled: boolean): void {
  db.prepare(`UPDATE workflows SET enabled = ?, updated_at = ? WHERE slug = ?`).run(
    enabled ? 1 : 0,
    new Date().toISOString(),
    slug,
  );
}

const WORKFLOW_PATCH_FIELDS = ["schedule_cron", "enabled", "prompt"] as const;
export type WorkflowPatch = Partial<Pick<WorkflowRow, (typeof WORKFLOW_PATCH_FIELDS)[number]>>;

/** Partial update for the settings screen (schedule/enabled/prompt only). */
export function updateWorkflow(slug: string, fields: WorkflowPatch): WorkflowRow | undefined {
  const keys = (Object.keys(fields) as (keyof WorkflowPatch)[]).filter((k) =>
    WORKFLOW_PATCH_FIELDS.includes(k),
  );
  if (keys.length === 0) return getWorkflow(slug);
  const set = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => fields[k]);
  db.prepare(`UPDATE workflows SET ${set}, updated_at = ? WHERE slug = ?`).run(
    ...values,
    new Date().toISOString(),
    slug,
  );
  return getWorkflow(slug);
}

// ---------- runs ----------

export type RunRow = {
  id: number;
  workflow_id: number | null;
  kind: "workflow" | "chat" | "session";
  venture: string | null;
  prompt: string;
  status: "running" | "done" | "error" | "killed";
  started_at: string;
  finished_at: string | null;
  exit_code: number | null;
  result: string | null;
  log: string;
  session_id: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost_usd: number | null;
  duration_ms: number | null;
};

export type RunInput = {
  workflow_id?: number | null;
  kind?: RunRow["kind"];
  venture?: string | null;
  prompt: string;
  status?: RunRow["status"];
  session_id?: string | null;
};

const RUN_UPDATABLE_FIELDS = [
  "status",
  "finished_at",
  "exit_code",
  "result",
  "log",
  "session_id",
  "input_tokens",
  "output_tokens",
  "cost_usd",
  "duration_ms",
] as const;

export type RunUpdate = Partial<Pick<RunRow, (typeof RUN_UPDATABLE_FIELDS)[number]>>;

export function createRun(fields: RunInput): RunRow {
  const now = new Date().toISOString();
  const info = db
    .prepare(
      `INSERT INTO runs (workflow_id, kind, venture, prompt, status, started_at, session_id)
       VALUES (?,?,?,?,?,?,?)`,
    )
    .run(
      fields.workflow_id ?? null,
      fields.kind ?? "workflow",
      fields.venture ?? null,
      fields.prompt,
      fields.status ?? "running",
      now,
      fields.session_id ?? null,
    );
  return getRun(info.lastInsertRowid as number)!;
}

export function updateRun(id: number, fields: RunUpdate): void {
  const keys = Object.keys(fields) as (keyof RunUpdate)[];
  if (keys.length === 0) return;
  const set = keys.map((k) => `${k} = ?`).join(", ");
  const values = keys.map((k) => fields[k]);
  db.prepare(`UPDATE runs SET ${set} WHERE id = ?`).run(...values, id);
}

export function appendRunLog(id: number, chunk: string): void {
  db.prepare(`UPDATE runs SET log = log || ? WHERE id = ?`).run(chunk, id);
}

export function getRun(id: number): RunRow | undefined {
  return db.prepare(`SELECT * FROM runs WHERE id = ?`).get(id) as RunRow | undefined;
}

export function listRuns(opts: { kind?: RunRow["kind"]; limit?: number } = {}): RunRow[] {
  const limit = opts.limit ?? 50;
  if (opts.kind) {
    return db
      .prepare(`SELECT * FROM runs WHERE kind = ? ORDER BY id DESC LIMIT ?`)
      .all(opts.kind, limit) as RunRow[];
  }
  return db.prepare(`SELECT * FROM runs ORDER BY id DESC LIMIT ?`).all(limit) as RunRow[];
}

export function listActiveRuns(): RunRow[] {
  return db
    .prepare(`SELECT * FROM runs WHERE status = 'running' ORDER BY id DESC`)
    .all() as RunRow[];
}

// ---------- threads & messages ----------

export type ThreadRow = {
  id: number;
  agent: string;
  venture: string | null;
  title: string;
  created_at: string;
  updated_at: string;
};

export type MessageRow = {
  id: number;
  thread_id: number;
  role: "user" | "agent";
  content: string;
  run_id: number | null;
  created_at: string;
};

export function createThread(agent: string, venture: string | null, title: string): ThreadRow {
  const now = new Date().toISOString();
  const info = db
    .prepare(`INSERT INTO threads (agent, venture, title, created_at, updated_at) VALUES (?,?,?,?,?)`)
    .run(agent, venture, title, now, now);
  return db.prepare(`SELECT * FROM threads WHERE id = ?`).get(info.lastInsertRowid) as ThreadRow;
}

export function listThreads(agent?: string): ThreadRow[] {
  if (agent) {
    return db
      .prepare(`SELECT * FROM threads WHERE agent = ? ORDER BY updated_at DESC`)
      .all(agent) as ThreadRow[];
  }
  return db.prepare(`SELECT * FROM threads ORDER BY updated_at DESC`).all() as ThreadRow[];
}

export function addMessage(
  threadId: number,
  role: MessageRow["role"],
  content: string,
  runId?: number,
): MessageRow {
  const now = new Date().toISOString();
  const info = db
    .prepare(`INSERT INTO messages (thread_id, role, content, run_id, created_at) VALUES (?,?,?,?,?)`)
    .run(threadId, role, content, runId ?? null, now);
  db.prepare(`UPDATE threads SET updated_at = ? WHERE id = ?`).run(now, threadId);
  return db.prepare(`SELECT * FROM messages WHERE id = ?`).get(info.lastInsertRowid) as MessageRow;
}

export function listMessages(threadId: number): MessageRow[] {
  return db
    .prepare(`SELECT * FROM messages WHERE thread_id = ? ORDER BY id`)
    .all(threadId) as MessageRow[];
}

// ---------- queue (approval proposals) ----------

export type QueueRow = {
  id: number;
  run_id: number | null;
  agent: string | null;
  venture: string | null;
  kind: "linear_issue" | "gmail_draft";
  payload: string;
  status: "pending" | "approved" | "rejected" | "executed" | "failed";
  reason: string | null;
  result: string | null;
  created_at: string;
  resolved_at: string | null;
};

export type QueueInput = {
  run_id?: number | null;
  agent?: string | null;
  venture?: string | null;
  kind: QueueRow["kind"];
  payload: string;
  reason?: string | null;
};

export function createProposal(fields: QueueInput): QueueRow {
  const now = new Date().toISOString();
  const info = db
    .prepare(
      `INSERT INTO queue (run_id, agent, venture, kind, payload, status, reason, created_at)
       VALUES (?,?,?,?,?, 'pending', ?, ?)`,
    )
    .run(
      fields.run_id ?? null,
      fields.agent ?? null,
      fields.venture ?? null,
      fields.kind,
      fields.payload,
      fields.reason ?? null,
      now,
    );
  return db.prepare(`SELECT * FROM queue WHERE id = ?`).get(info.lastInsertRowid) as QueueRow;
}

export function listProposals(status?: QueueRow["status"]): QueueRow[] {
  if (status) {
    return db
      .prepare(`SELECT * FROM queue WHERE status = ? ORDER BY id DESC`)
      .all(status) as QueueRow[];
  }
  return db.prepare(`SELECT * FROM queue ORDER BY id DESC`).all() as QueueRow[];
}

export function resolveProposal(
  id: number,
  status: QueueRow["status"],
  reason?: string,
  result?: string,
): void {
  db.prepare(
    `UPDATE queue SET status = ?, reason = COALESCE(?, reason), result = COALESCE(?, result),
     resolved_at = ? WHERE id = ?`,
  ).run(status, reason ?? null, result ?? null, new Date().toISOString(), id);
}

// ---------- briefings ----------

export type BriefingRow = {
  id: number;
  workflow_id: number | null;
  run_id: number | null;
  title: string;
  content: string;
  unread: number; // 0 | 1
  created_at: string;
};

export type BriefingInput = {
  workflow_id?: number | null;
  run_id?: number | null;
  title: string;
  content: string;
};

export function createBriefing(fields: BriefingInput): BriefingRow {
  const now = new Date().toISOString();
  const info = db
    .prepare(
      `INSERT INTO briefings (workflow_id, run_id, title, content, unread, created_at)
       VALUES (?,?,?,?, 1, ?)`,
    )
    .run(fields.workflow_id ?? null, fields.run_id ?? null, fields.title, fields.content, now);
  return db.prepare(`SELECT * FROM briefings WHERE id = ?`).get(info.lastInsertRowid) as BriefingRow;
}

export function listBriefings(limit = 50): BriefingRow[] {
  return db
    .prepare(`SELECT * FROM briefings ORDER BY id DESC LIMIT ?`)
    .all(limit) as BriefingRow[];
}

export function markBriefingRead(id: number): void {
  db.prepare(`UPDATE briefings SET unread = 0 WHERE id = ?`).run(id);
}

export function unreadBriefingCount(): number {
  const row = db
    .prepare(`SELECT COUNT(*) AS c FROM briefings WHERE unread = 1`)
    .get() as { c: number };
  return row.c;
}

// ---------- settings ----------

export function getSetting(key: string): string | undefined {
  const row = db.prepare(`SELECT value FROM settings WHERE key = ?`).get(key) as
    | { value: string }
    | undefined;
  return row?.value;
}

export function setSetting(key: string, value: string): void {
  db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)
              ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(key, value);
}
