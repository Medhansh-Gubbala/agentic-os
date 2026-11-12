import { NextResponse } from "next/server";
import cron from "node-cron";
import { getWorkflow, updateWorkflow } from "@/lib/db";
import { resyncSchedules } from "@/lib/scheduler";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const workflow = getWorkflow(slug);
  if (!workflow) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(workflow);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getWorkflow(slug)) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const { schedule_cron, enabled, prompt } = body ?? {};

  if (schedule_cron != null && !cron.validate(schedule_cron)) {
    return NextResponse.json({ error: "invalid schedule_cron" }, { status: 400 });
  }
  if (prompt != null && (typeof prompt !== "string" || !prompt.trim())) {
    return NextResponse.json({ error: "prompt cannot be empty" }, { status: 400 });
  }

  const row = updateWorkflow(slug, {
    ...(schedule_cron != null ? { schedule_cron } : {}),
    ...(enabled != null ? { enabled: enabled ? 1 : 0 } : {}),
    ...(prompt != null ? { prompt } : {}),
  });

  resyncSchedules();
  return NextResponse.json(row);
}
