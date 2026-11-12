import { NextResponse } from "next/server";
import { listRuns, type RunRow } from "@/lib/db";
import { startRun } from "@/lib/conductor";
import { ventureRepoPath } from "@/lib/registry";

export const dynamic = "force-dynamic";

export async function GET() {
  const runs = listRuns({ kind: "session", limit: 50 });
  const stripped = runs.map(({ log, ...rest }: RunRow) => ({
    ...rest,
    log_chars: log.length,
  }));
  return NextResponse.json({ runs: stripped });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { venture, prompt } = body ?? {};

  if (typeof venture !== "string" || !venture) {
    return NextResponse.json({ error: "venture is required" }, { status: 400 });
  }
  if (typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 });
  }
  const repo = ventureRepoPath(venture);
  if (!repo) {
    return NextResponse.json(
      { error: `no repo mapped for venture: ${venture}` },
      { status: 400 },
    );
  }

  try {
    const { runId } = startRun({
      kind: "session",
      venture,
      promptOverride: prompt,
      allowedTools: ["Read", "Grep", "Glob", "Write", "Edit", "Bash"],
      model: "claude-sonnet-5",
      cwd: repo,
    });
    return NextResponse.json({ runId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
