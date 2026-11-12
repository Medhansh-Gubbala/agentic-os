import { NextResponse } from "next/server";
import { getWorkflow } from "@/lib/db";
import { startRun } from "@/lib/conductor";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const workflow = getWorkflow(slug);
  if (!workflow) return NextResponse.json({ error: "not found" }, { status: 404 });

  const requires: string[] = JSON.parse(workflow.requires);
  const missing = requires.filter((r) =>
    r === "linear"
      ? !process.env.LINEAR_API_KEY
      : r === "google" || r === "interactive"
        ? true
        : false,
  );
  if (missing.length > 0) {
    return NextResponse.json({ error: "not configured", missing }, { status: 412 });
  }

  const body = await request.json().catch(() => ({}));
  const { venture, input } = body ?? {};

  try {
    const { runId } = startRun({ workflowSlug: slug, kind: "workflow", venture, input });
    return NextResponse.json({ runId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message === "already running") {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
