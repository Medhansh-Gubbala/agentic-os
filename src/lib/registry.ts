import fs from "fs";
import path from "path";
import { upsertWorkflow, getWorkflow, getSetting, setSetting, type WorkflowInput } from "./db.ts";

const SEED_PATH = path.join(process.cwd(), "data", "workflows.seed.json");

// Venture slug -> repo path, from env so no machine paths live in the repo.
// e.g. VENTURE_REPOS='{"my-saas":"/home/me/projects/my-saas"}'
const VENTURE_REPOS: Record<string, string> = JSON.parse(process.env.VENTURE_REPOS ?? "{}");

type SeedRow = Omit<WorkflowInput, "allowed_tools" | "requires" | "takes_venture" | "enabled"> & {
  allowed_tools: string[];
  requires: string[];
  takes_venture: boolean;
  enabled: boolean;
};

export function syncSeed(): void {
  const seed: SeedRow[] = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
  for (const row of seed) {
    // Insert-only: after first seed the DB owns the row — re-upserting on every
    // boot would silently revert prompt/schedule/enabled edits made in Settings.
    if (getWorkflow(row.slug)) continue;
    upsertWorkflow({
      ...row,
      allowed_tools: JSON.stringify(row.allowed_tools),
      requires: JSON.stringify(row.requires),
      takes_venture: row.takes_venture ? 1 : 0,
      enabled: row.enabled ? 1 : 0,
    });
  }
  for (const [venture, repo] of Object.entries(VENTURE_REPOS)) {
    const key = `repo:${venture}`;
    if (getSetting(key) === undefined) setSetting(key, repo);
  }
}

export function ventureRepoPath(venture: string): string | null {
  return getSetting(`repo:${venture}`) ?? null;
}
