import { NextResponse } from "next/server";
import { getThread, sendMessage } from "@/lib/chat";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const thread = getThread(Number(id));
  if (!thread) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  const { content } = body ?? {};
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  try {
    const { runId } = sendMessage({
      agent: thread.agent,
      threadId: thread.id,
      venture: thread.venture ?? undefined,
      content,
    });
    return NextResponse.json({ runId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
