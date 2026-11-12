import { NextResponse } from "next/server";
import { listMessages, getRun } from "@/lib/db";
import { getThread } from "@/lib/chat";
import { extractResultJson } from "@/lib/conductor";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const thread = getThread(Number(id));
  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });

  const messages = listMessages(thread.id).map((m) => {
    const run = m.run_id ? getRun(m.run_id) : undefined;
    const proposals = run?.result ? extractResultJson(run.result)?.proposals : undefined;
    return { ...m, proposalCount: Array.isArray(proposals) ? proposals.length : 0 };
  });

  return NextResponse.json({ thread, messages });
}
