import { NextResponse } from "next/server";
import { getRun } from "@/lib/db";
import { extractResultJson } from "@/lib/conductor";

export const dynamic = "force-dynamic";

/** Thin wrapper over GET /api/runs/[id] for the marketing compose flow: once a
 * generation run is done, hand back the extracted {title, content} instead of
 * making the client re-implement the fenced-JSON parsing conductor.ts already does. */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const run = getRun(Number(id));
  if (!run) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (run.status === "running") {
    return NextResponse.json({ status: "running" });
  }
  if (run.status !== "done") {
    return NextResponse.json({ status: run.status, error: run.result ?? "run failed" });
  }

  const parsed = run.result ? extractResultJson(run.result) : null;
  return NextResponse.json({
    status: "done",
    title: parsed?.title ?? null,
    content: parsed?.content_markdown ?? run.result ?? "",
  });
}
