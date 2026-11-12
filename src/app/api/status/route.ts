import { NextResponse } from "next/server";
import { db, listWorkflows, listActiveRuns, unreadBriefingCount, listProposals } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const workflows = listWorkflows().filter((w) => w.enabled);

  const byType: Record<string, number> = {};
  for (const w of workflows) byType[w.type] = (byType[w.type] ?? 0) + 1;

  const todayPrefix = new Date().toISOString().slice(0, 10);
  const tokensRow = db
    .prepare(
      `SELECT COALESCE(SUM(input_tokens), 0) + COALESCE(SUM(output_tokens), 0) AS total
       FROM runs WHERE started_at >= ?`,
    )
    .get(todayPrefix) as { total: number };

  return NextResponse.json({
    workflows: workflows.length,
    byType,
    activeRuns: listActiveRuns().length,
    routines: byType.routine ?? 0,
    integrations: {
      linear: !!process.env.LINEAR_API_KEY,
      google: false,
      claude: true,
    },
    unreadBriefings: unreadBriefingCount(),
    pendingProposals: listProposals("pending").length,
    tokensToday: tokensRow.total,
  });
}
