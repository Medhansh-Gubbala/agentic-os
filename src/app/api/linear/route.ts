import { NextResponse } from "next/server";
import { linearConfigured, listProjects } from "@/lib/linear";

export async function GET() {
  if (!linearConfigured()) {
    return NextResponse.json({ configured: false, projects: [] });
  }
  return NextResponse.json({ configured: true, projects: await listProjects() });
}
