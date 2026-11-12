import { NextResponse } from "next/server";
import { discoverAgents } from "@/lib/agents";
import { listThreads } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const agents = discoverAgents().map((a) => ({ ...a, threadCount: listThreads(a.slug).length }));
  return NextResponse.json({ agents });
}
