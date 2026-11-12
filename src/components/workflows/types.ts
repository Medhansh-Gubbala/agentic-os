export type Workflow = {
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
  allowed_tools: string[];
  cwd_mode: string;
  takes_venture: 0 | 1;
  requires: string; // JSON-encoded string[], e.g. '["google"]'
  enabled: 0 | 1;
  activeRunId: number | null;
  lastRun: { id: number; status: string; finished_at: string | null } | null;
};

export type StatusResponse = {
  workflows: number;
  byType: Record<string, number>;
  activeRuns: number;
  routines: number;
  integrations: { linear: boolean; google: boolean; claude: boolean };
  unreadBriefings: number;
  pendingProposals: number;
  tokensToday: number;
};

export type VentureLite = { slug: string; seeded: boolean };

export const BRANCHES = [
  "memory",
  "productivity",
  "research",
  "content",
  "finance",
  "ops",
] as const;

export function parseRequires(requires: string): string[] {
  try {
    const arr = JSON.parse(requires);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** First required integration this workflow is missing, or null if fully configured. */
export function missingRequirement(
  workflow: Workflow,
  integrations: StatusResponse["integrations"] | null,
): string | null {
  if (!integrations) return null;
  for (const req of parseRequires(workflow.requires)) {
    if (req === "google" && !integrations.google) return "google";
    if (req === "linear" && !integrations.linear) return "linear";
    if (req === "interactive") return "terminal session";
  }
  return null;
}
