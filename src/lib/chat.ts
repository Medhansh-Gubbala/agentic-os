import fs from "fs";
import path from "path";
import {
  createThread,
  addMessage,
  listMessages,
  listThreads,
  type ThreadRow,
} from "./db.ts";
import { startRun, subscribeRun } from "./conductor.ts";
import { VAULT_ROOT, getVenture, listVentures } from "./vault.ts";
import { ventureRepoPath } from "./registry.ts";
import { AGENTS, discoverAgents, loadAgentBody, type CsuiteSlug } from "./agents.ts";

export { AGENTS };
export type AgentSlug = CsuiteSlug;

const CSUITE_SLUGS = new Set<string>(AGENTS.map((a) => a.slug));

function loadPersona(agent: CsuiteSlug): string {
  const p = path.join(process.cwd(), "data", "personas", `${agent}.md`);
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    throw new Error(`persona file missing for agent "${agent}": ${p}`);
  }
}

type RunConfig = { persona: string; model: string; allowedTools: string[]; cwd: string };

/** C-suite path is byte-for-byte the original behavior. Discovered agents
 * (global or venture .claude/agents/*.md) resolve persona/tools/model from
 * their frontmatter+body, and cwd from their home repo (or the thread's
 * venture repo, for global agents attached to a venture thread). */
export function resolveRunConfig(agent: string, venture: string | undefined): RunConfig {
  if (CSUITE_SLUGS.has(agent)) {
    return {
      persona: loadPersona(agent as CsuiteSlug),
      model: "claude-sonnet-5",
      allowedTools: ["Read", "Grep", "Glob"],
      cwd: VAULT_ROOT,
    };
  }

  const def = discoverAgents().find((a) => a.slug === agent);
  if (!def || !def.filePath) throw new Error(`unknown agent: ${agent}`);

  const cwd =
    def.source === "global"
      ? (venture && ventureRepoPath(venture)) || VAULT_ROOT
      : ventureRepoPath(def.source) ?? VAULT_ROOT;

  return { persona: loadAgentBody(def.filePath), model: def.model, allowedTools: def.tools, cwd };
}

// ponytail: db.ts has no getThread(id) and we're told not to add one — a
// linear scan over listThreads() is fine at this scale (dozens of threads).
export function getThread(threadId: number): ThreadRow | undefined {
  return listThreads().find((t) => t.id === threadId);
}

function contextBlock(venture: string | undefined): string {
  if (venture) {
    const v = getVenture(venture);
    if (!v) throw new Error(`unknown venture: ${venture}`);
    const decisions =
      v.decisions.map((d) => `- ${d.date} — ${d.text}`).join("\n") || "(none)";
    return [
      `Venture: ${v.slug}`,
      "",
      "## North Star",
      v.northStar?.raw ?? "(no North Star.md)",
      "",
      "## Decisions",
      decisions,
      "",
      "## Memory",
      v.memory?.raw ?? "(no MEMORY.md)",
    ].join("\n");
  }

  const seeded = listVentures().filter((v) => v.seeded);
  if (seeded.length === 0) return "(no seeded ventures)";
  return seeded
    .map(
      (v) =>
        `- ${v.slug} — ${v.northStar?.currentFocus || "(no current focus)"} — last memory: ${
          v.memory?.lastEntryDate ?? "never"
        }`,
    )
    .join("\n");
}

/** History excludes the just-added current message (added by the caller right
 * before this runs) so it isn't duplicated against the "# NEW MESSAGE" block. */
function conversationBlock(threadId: number): string {
  const all = listMessages(threadId);
  const history = all.slice(0, -1).slice(-20);
  if (history.length === 0) return "";
  const lines = history.map((m) => `${m.role === "user" ? "User" : "Agent"}: ${m.content}`);
  return `# CONVERSATION SO FAR\n${lines.join("\n")}`;
}

function stripProposalFence(text: string): string {
  return text.replace(/```json\s*[\s\S]*?```/i, "").trim();
}

export function sendMessage(opts: {
  agent: string;
  threadId?: number;
  venture?: string;
  content: string;
}): { threadId: number; runId: number } {
  const config = resolveRunConfig(opts.agent, opts.venture);

  let thread: ThreadRow;
  if (opts.threadId) {
    const existing = getThread(opts.threadId);
    if (!existing) throw new Error(`unknown thread: ${opts.threadId}`);
    thread = existing;
  } else {
    thread = createThread(opts.agent, opts.venture ?? null, opts.content.slice(0, 60));
  }

  addMessage(thread.id, "user", opts.content);

  const prompt = [
    config.persona,
    "# CONTEXT",
    contextBlock(thread.venture ?? undefined),
    conversationBlock(thread.id),
    "# NEW MESSAGE",
    opts.content,
    "Reply as the persona, markdown, concise.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const { runId } = startRun({
    kind: "chat",
    venture: thread.venture ?? undefined,
    promptOverride: prompt,
    model: config.model,
    allowedTools: config.allowedTools,
    cwd: config.cwd,
  });

  subscribeRun(runId, (ev) => {
    if (ev.type !== "status" || ev.run.status === "running") return;
    const reply =
      ev.run.status === "done"
        ? stripProposalFence(ev.run.result ?? "")
        : `_(run ${ev.run.status} — no reply)_`;
    addMessage(thread.id, "agent", reply, runId);
  });

  return { threadId: thread.id, runId };
}
