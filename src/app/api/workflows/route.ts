import { NextResponse } from "next/server";
import {
  listWorkflows,
  listRuns,
  upsertWorkflow,
  type WorkflowInput,
  type WorkflowRow,
} from "@/lib/db";
import { syncSeed } from "@/lib/registry";

export const dynamic = "force-dynamic";

const BRANCHES = ["memory", "productivity", "research", "content", "finance", "ops"];
const TYPES = ["manual", "skill", "routine", "agent"];
const CADENCES = ["on_demand", "scheduled", "long_running"];
const CWD_MODES = ["vault", "venture_repo", "project"];

let seeded = false;

export async function GET() {
  if (!seeded) {
    syncSeed();
    seeded = true;
  }
  const allRuns = listRuns({ limit: 500 });
  const workflows = listWorkflows().map((w: WorkflowRow) => {
    const runs = allRuns.filter((r) => r.workflow_id === w.id);
    const active = runs.find((r) => r.status === "running");
    const last = runs[0];
    return {
      ...w,
      activeRunId: active?.id ?? null,
      lastRun: last ? { id: last.id, status: last.status, finished_at: last.finished_at } : null,
    };
  });
  return NextResponse.json({ workflows });
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    slug,
    name,
    branch,
    type,
    cadence,
    schedule_cron = null,
    scope = "",
    prompt,
    model = "claude-sonnet-5",
    allowed_tools = ["Read", "Grep", "Glob"],
    cwd_mode = "vault",
    takes_venture = false,
    requires = [],
  } = body ?? {};

  if (typeof slug !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return NextResponse.json({ error: "slug must be kebab-case" }, { status: 400 });
  }
  if (!name || typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "name and prompt are required" }, { status: 400 });
  }
  if (!BRANCHES.includes(branch)) {
    return NextResponse.json({ error: `branch must be one of ${BRANCHES.join(", ")}` }, { status: 400 });
  }
  if (!TYPES.includes(type)) {
    return NextResponse.json({ error: `type must be one of ${TYPES.join(", ")}` }, { status: 400 });
  }
  if (!CADENCES.includes(cadence)) {
    return NextResponse.json({ error: `cadence must be one of ${CADENCES.join(", ")}` }, { status: 400 });
  }
  if (!CWD_MODES.includes(cwd_mode)) {
    return NextResponse.json({ error: `cwd_mode must be one of ${CWD_MODES.join(", ")}` }, { status: 400 });
  }

  const input: WorkflowInput = {
    slug,
    name,
    branch,
    type,
    cadence,
    schedule_cron,
    scope,
    prompt,
    model,
    allowed_tools: JSON.stringify(allowed_tools),
    cwd_mode,
    takes_venture: takes_venture ? 1 : 0,
    requires: JSON.stringify(requires),
    enabled: 1,
  };

  const row = upsertWorkflow(input);
  return NextResponse.json(row, { status: 201 });
}
