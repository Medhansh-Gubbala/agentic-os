import { NextResponse } from "next/server";
import { listRuns, listWorkflows, type RunRow } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const slugById = new Map(listWorkflows().map((w) => [w.id, w.slug]));
  const runs = listRuns({ limit: 50 }).map(({ log, workflow_id, ...rest }: RunRow) => ({
    ...rest,
    workflow_slug: workflow_id != null ? (slugById.get(workflow_id) ?? null) : null,
  }));
  return NextResponse.json({ runs });
}
