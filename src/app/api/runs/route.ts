import { NextResponse } from "next/server";
import { listRuns, type RunRow } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get("kind") as RunRow["kind"] | null;
  const limit = Number(searchParams.get("limit")) || undefined;
  return NextResponse.json({ runs: listRuns({ kind: kind ?? undefined, limit }) });
}
