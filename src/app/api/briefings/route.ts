import { NextResponse } from "next/server";
import { listBriefings, listWorkflows, unreadBriefingCount } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit")) || undefined;

  const workflowNames = new Map(listWorkflows().map((w) => [w.id, w.name]));
  const briefings = listBriefings(limit).map((b) => ({
    ...b,
    workflow_name: b.workflow_id ? (workflowNames.get(b.workflow_id) ?? null) : null,
  }));

  return NextResponse.json({ briefings, unread: unreadBriefingCount() });
}
