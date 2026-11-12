import { NextResponse } from "next/server";
import { markBriefingRead } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (body?.action !== "read") {
    return NextResponse.json({ error: "unsupported action" }, { status: 400 });
  }
  markBriefingRead(Number(id));
  return NextResponse.json({ ok: true });
}
