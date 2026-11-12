import { NextResponse } from "next/server";
import { getRun } from "@/lib/db";
import { killRun } from "@/lib/conductor";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const runId = Number(id);
  const run = getRun(runId);
  if (!run || run.status !== "running") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  killRun(runId);
  return NextResponse.json({ ok: true });
}
