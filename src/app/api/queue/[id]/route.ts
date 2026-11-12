import { NextResponse } from "next/server";
import { resolveProposal } from "@/lib/db";
import { executeProposal, getProposal } from "@/lib/executors";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  const row = getProposal(id);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (row.status !== "pending") {
    return NextResponse.json({ error: "not pending" }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const action = body?.action;

  if (action === "approve") {
    resolveProposal(id, "approved");
    await executeProposal(id);
  } else if (action === "reject") {
    resolveProposal(id, "rejected", body?.reason);
  } else {
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  }

  const final = getProposal(id)!;
  return NextResponse.json({ ...final, payload: JSON.parse(final.payload) });
}
