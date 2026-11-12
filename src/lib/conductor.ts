import { spawn, type ChildProcess } from "child_process";
import fs from "fs";
import path from "path";

/** Resolve the claude CLI next to the running node binary — PATH under pm2 /
 * boot tasks gets rewritten by npm and cannot be trusted. */
export function claudeBin(): string {
  const local = path.join(path.dirname(process.execPath), "claude");
  return fs.existsSync(local) ? local : "claude";
}
import {
  getWorkflow,
  getRun,
  createRun,
  updateRun,
  appendRunLog,
  listActiveRuns,
  createBriefing,
  createProposal,
  type RunRow,
  type RunUpdate,
  type WorkflowRow,
} from "./db.ts";
import { VAULT_ROOT } from "./vault.ts";
import { ventureRepoPath } from "./registry.ts";

export type RunEvent = { type: "log"; chunk: string } | { type: "status"; run: RunRow };

export type StartRunOpts = {
  workflowSlug?: string;
  kind: RunRow["kind"];
  venture?: string;
  input?: string;
  promptOverride?: string;
  model?: string;
  allowedTools?: string[];
  cwd?: string;
};

type LiveProc = { child: ChildProcess; subs: Set<(ev: RunEvent) => void> };

// ponytail: single process owns all live runs; fine for one operator, one machine.
const live = new Map<number, LiveProc>();

function substitute(template: string, venture: string | undefined, input: string | undefined): string {
  const date = new Date().toISOString().slice(0, 10);
  return template
    .replace(/\{\{vault_root\}\}/g, VAULT_ROOT)
    .replace(/\{\{venture\}\}/g, venture ?? "")
    .replace(/\{\{input\}\}/g, input ?? "")
    .replace(/\{\{date\}\}/g, date);
}

function emit(runId: number, ev: RunEvent): void {
  live.get(runId)?.subs.forEach((cb) => cb(ev));
}

export function subscribeRun(runId: number, cb: (ev: RunEvent) => void): () => void {
  const p = live.get(runId);
  if (!p) return () => {};
  p.subs.add(cb);
  return () => p.subs.delete(cb);
}

function extractText(content: unknown): string {
  if (!Array.isArray(content)) return "";
  return content
    .filter((b): b is { type: string; text: string } => b?.type === "text")
    .map((b) => b.text)
    .join("");
}

type ResultJson = {
  title?: string;
  content_markdown?: string;
  proposals?: { kind?: string; venture?: string }[];
};

/** Models often wrap the contract JSON in prose and/or ```json fences — try, in
 * order: raw parse, first fenced block, first-{ to last-} substring. */
export function extractResultJson(result: string): ResultJson | null {
  const candidates = [result.trim()];
  const fence = result.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) candidates.push(fence[1].trim());
  const first = result.indexOf("{");
  const last = result.lastIndexOf("}");
  if (first !== -1 && last > first) candidates.push(result.slice(first, last + 1));
  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c);
      if (parsed && typeof parsed === "object") return parsed as ResultJson;
    } catch {
      /* try next */
    }
  }
  return null;
}

function postProcess(run: RunRow, workflow: WorkflowRow | undefined, venture: string | null): void {
  if (!run.result) return;
  const parsed = extractResultJson(run.result);
  if (!parsed) return; // non-JSON result is fine, just stored on the run row

  if (workflow?.type === "routine") {
    createBriefing({
      workflow_id: workflow.id,
      run_id: run.id,
      title: parsed.title ?? workflow.name,
      content: parsed.content_markdown ?? run.result,
    });
  }

  if (Array.isArray(parsed.proposals)) {
    for (const p of parsed.proposals) {
      if (p?.kind === "linear_issue" || p?.kind === "gmail_draft") {
        createProposal({
          run_id: run.id,
          venture: venture ?? p.venture ?? null,
          kind: p.kind,
          payload: JSON.stringify(p),
        });
      }
    }
  }
}

function finishRun(
  runId: number,
  fields: RunUpdate,
  workflow: WorkflowRow | undefined,
  venture: string | null,
): void {
  updateRun(runId, fields);
  const run = getRun(runId)!;
  emit(runId, { type: "status", run });
  live.delete(runId);
  if (fields.status === "done") postProcess(run, workflow, venture);
}

function handleLine(
  runId: number,
  line: string,
  workflow: WorkflowRow | undefined,
  venture: string | null,
): void {
  let ev: {
    type?: string;
    subtype?: string;
    is_error?: boolean;
    message?: { content?: unknown };
    result?: string;
    session_id?: string;
    total_cost_usd?: number;
    duration_ms?: number;
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  try {
    ev = JSON.parse(line);
  } catch {
    return; // partial/non-JSON line, ignore
  }

  if (ev.type === "assistant") {
    const text = extractText(ev.message?.content);
    if (text) {
      appendRunLog(runId, text);
      emit(runId, { type: "log", chunk: text });
    }
  } else if (ev.type === "result") {
    const success = ev.subtype === "success" && !ev.is_error;
    finishRun(
      runId,
      {
        status: success ? "done" : "error",
        finished_at: new Date().toISOString(),
        exit_code: 0,
        result: ev.result ?? null,
        session_id: ev.session_id ?? null,
        input_tokens: ev.usage?.input_tokens ?? null,
        output_tokens: ev.usage?.output_tokens ?? null,
        cost_usd: ev.total_cost_usd ?? null,
        duration_ms: ev.duration_ms ?? null,
      },
      workflow,
      venture,
    );
  }
}

export function startRun(opts: StartRunOpts): { runId: number } {
  let workflow: WorkflowRow | undefined;
  if (opts.workflowSlug) {
    workflow = getWorkflow(opts.workflowSlug);
    if (!workflow) throw new Error(`unknown workflow: ${opts.workflowSlug}`);
    if (listActiveRuns().some((r) => r.workflow_id === workflow!.id)) {
      throw new Error("already running");
    }
  }

  const promptTemplate = opts.promptOverride ?? workflow?.prompt;
  if (!promptTemplate) throw new Error("no prompt");
  const prompt = substitute(promptTemplate, opts.venture, opts.input);

  const model = opts.model ?? workflow?.model ?? "claude-sonnet-5";
  const allowedTools = opts.allowedTools ?? (workflow ? JSON.parse(workflow.allowed_tools) : ["Read"]);

  let cwd: string;
  if (opts.cwd) {
    cwd = opts.cwd;
  } else {
    const cwdMode = workflow?.cwd_mode ?? "project";
    if (cwdMode === "vault") {
      cwd = VAULT_ROOT;
    } else if (cwdMode === "venture_repo") {
      if (!opts.venture) throw new Error("venture_repo cwd_mode requires a venture");
      const repo = ventureRepoPath(opts.venture);
      if (!repo) throw new Error(`no repo mapped for venture: ${opts.venture}`);
      cwd = repo;
    } else {
      cwd = process.cwd();
    }
  }

  const venture = opts.venture ?? null;
  const run = createRun({
    workflow_id: workflow?.id ?? null,
    kind: opts.kind,
    venture,
    prompt,
  });

  const args = [
    "-p",
    prompt,
    "--model",
    model,
    "--allowedTools",
    allowedTools.join(","),
    "--output-format",
    "stream-json",
    "--verbose",
    "--max-turns",
    // 25 starved vault-health-check once the vault hit 11 venture folders
    // (run 18: max-turns cutoff mid-scan). Still a hard runaway bound.
    "50",
  ];

  const child = spawn(claudeBin(), args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
  live.set(run.id, { child, subs: new Set() });

  // spawn failure (e.g. ENOENT) emits "error" WITHOUT "close" — without this
  // handler the run row would sit in "running" forever with an empty log.
  child.on("error", (err) => {
    appendRunLog(run.id, `\n[spawn error] ${err.message}`);
    finishRun(
      run.id,
      { status: "error", finished_at: new Date().toISOString(), exit_code: null },
      workflow,
      venture,
    );
    live.delete(run.id);
  });

  let buf = "";
  let stderrTail = "";

  child.stdout!.on("data", (data: Buffer) => {
    buf += data.toString();
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim()) handleLine(run.id, line, workflow, venture);
    }
  });

  child.stderr!.on("data", (data: Buffer) => {
    stderrTail = (stderrTail + data.toString()).slice(-4000);
  });

  child.on("close", (code) => {
    // Only the abnormal-exit path lands here: the result event already
    // finished the run (status done/error) and removed it from `live`.
    const current = getRun(run.id);
    if (current && current.status === "running") {
      if (stderrTail) appendRunLog(run.id, `\n[stderr]\n${stderrTail}`);
      finishRun(
        run.id,
        { status: "error", finished_at: new Date().toISOString(), exit_code: code },
        workflow,
        venture,
      );
    }
    live.delete(run.id);
  });

  return { runId: run.id };
}

export function killRun(runId: number): void {
  const p = live.get(runId);
  if (!p) return;
  p.child.kill();
  updateRun(runId, { status: "killed", finished_at: new Date().toISOString() });
  emit(runId, { type: "status", run: getRun(runId)! });
  live.delete(runId);
}
