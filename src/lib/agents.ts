import fs from "fs";
import os from "os";
import path from "path";
import { parseFrontmatter, listVentures } from "./vault.ts";
import { ventureRepoPath } from "./registry.ts";

// Canonical C-suite list — the sole source of truth for these 4 slugs.
// chat.ts imports this instead of redefining it.
export const AGENTS = [
  { slug: "ceo", name: "CEO", title: "Chief Executive" },
  { slug: "cmo", name: "CMO", title: "Chief Marketing Officer" },
  { slug: "cfo", name: "CFO", title: "Chief Financial Officer" },
  { slug: "cto", name: "CTO", title: "Chief Technology Officer" },
] as const;

export type CsuiteSlug = (typeof AGENTS)[number]["slug"];

const GLOBAL_AGENTS_DIR = path.join(os.homedir(), ".claude", "agents");
const DEFAULT_TOOLS = ["Read", "Grep", "Glob"];

export type AgentDef = {
  slug: string;
  name: string;
  description: string;
  /** "csuite" | "global" | a venture slug */
  source: string;
  /** null for csuite (persona lives in data/personas/<slug>.md) */
  filePath: string | null;
  tools: string[];
  model: string;
  writesCode: boolean;
};

function resolveModel(frontmatterModel: string | undefined): string {
  return frontmatterModel === "opus" ? "claude-opus-4-8" : "claude-sonnet-5";
}

function readAgentDir(dir: string, source: string): AgentDef[] {
  let files: string[];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));
  } catch {
    return []; // no .claude/agents dir for this source — fine, not every repo has one
  }
  return files.map((file) => {
    const filePath = path.join(dir, file);
    const { frontmatter } = parseFrontmatter(fs.readFileSync(filePath, "utf8"));
    const name = frontmatter.name || file.replace(/\.md$/, "");
    const tools = frontmatter.tools
      ? frontmatter.tools.split(",").map((t) => t.trim()).filter(Boolean)
      : DEFAULT_TOOLS;
    return {
      slug: `${source}--${name}`,
      name,
      description: frontmatter.description ?? "",
      source,
      filePath,
      tools,
      model: resolveModel(frontmatter.model),
      writesCode: tools.some((t) => t === "Write" || t === "Edit" || t === "Bash"),
    };
  });
}

// ponytail: agent dirs hold a handful of .md files each — a plain re-scan per
// call is cheap enough that mtime-caching (like vault.ts's venture cache)
// isn't worth the extra invalidation logic.
export function discoverAgents(): AgentDef[] {
  const csuite: AgentDef[] = AGENTS.map((a) => ({
    slug: a.slug,
    name: a.name,
    description: a.title,
    source: "csuite",
    filePath: null,
    tools: ["Read", "Grep", "Glob"],
    model: "claude-sonnet-5",
    writesCode: false,
  }));

  const discovered = readAgentDir(GLOBAL_AGENTS_DIR, "global");
  for (const v of listVentures()) {
    const repo = ventureRepoPath(v.slug);
    if (!repo) continue;
    discovered.push(...readAgentDir(path.join(repo, ".claude", "agents"), v.slug));
  }

  return [...csuite, ...discovered];
}

export function getAgentDef(slug: string): AgentDef | undefined {
  return discoverAgents().find((a) => a.slug === slug);
}

/** Frontmatter stripped — the persona prompt body for a discovered (non-csuite) agent. */
export function loadAgentBody(filePath: string): string {
  return parseFrontmatter(fs.readFileSync(filePath, "utf8")).body.trim();
}
