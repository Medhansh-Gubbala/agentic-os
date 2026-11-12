import { NextResponse } from "next/server";
import { listProposals, type QueueRow } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as QueueRow["status"] | null;
  const rows = listProposals(status ?? undefined);
  return NextResponse.json({
    proposals: rows.map((r) => ({ ...r, payload: JSON.parse(r.payload) })),
  });
}
