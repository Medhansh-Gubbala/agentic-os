import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const AGENTS = ["ceo", "cmo", "cfo", "cto"] as const;
const PERSONA_DIR = path.join(process.cwd(), "data", "personas");

function personaPath(agent: string): string | null {
  if (!(AGENTS as readonly string[]).includes(agent)) return null;
  return path.join(PERSONA_DIR, `${agent}.md`);
}

export async function GET(_req: Request, { params }: { params: Promise<{ agent: string }> }) {
  const { agent } = await params;
  const file = personaPath(agent);
  if (!file) return NextResponse.json({ error: "unknown agent" }, { status: 400 });
  const content = fs.readFileSync(file, "utf-8");
  return NextResponse.json({ agent, content });
}

export async function PUT(request: Request, { params }: { params: Promise<{ agent: string }> }) {
  const { agent } = await params;
  const file = personaPath(agent);
  if (!file) return NextResponse.json({ error: "unknown agent" }, { status: 400 });
  const { content } = await request.json().catch(() => ({}));
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "content cannot be empty" }, { status: 400 });
  }
  fs.writeFileSync(file, content, "utf-8");
  return NextResponse.json({ agent, content });
}
