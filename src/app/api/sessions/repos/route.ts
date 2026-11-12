import { NextResponse } from "next/server";
import { listVentures } from "@/lib/vault";
import { ventureRepoPath, syncSeed } from "@/lib/registry";

export const dynamic = "force-dynamic";

export async function GET() {
  syncSeed(); // ponytail: idempotent upsert, cheap enough to run per request here
  const repos: Record<string, string> = {};
  for (const v of listVentures()) {
    if (!v.seeded) continue;
    const repo = ventureRepoPath(v.slug);
    if (repo) repos[v.slug] = repo;
  }
  return NextResponse.json(repos);
}
