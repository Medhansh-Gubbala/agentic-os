import { NextResponse } from "next/server";
import { listThreads } from "@/lib/db";
import { sendMessage } from "@/lib/chat";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agent: string }> },
) {
  const { agent } = await params;
  return NextResponse.json({ threads: listThreads(agent) });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ agent: string }> },
) {
  const { agent } = await params;
  const body = await request.json().catch(() => ({}));
  const { venture, content } = body ?? {};

  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  try {
    const result = sendMessage({ agent, venture, content });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
