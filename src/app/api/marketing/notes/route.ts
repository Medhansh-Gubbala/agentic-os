import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getVenture, writeVentureNote, VAULT_ROOT } from "@/lib/vault";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const venture = new URL(request.url).searchParams.get("venture");
  if (!venture || !getVenture(venture)) {
    return NextResponse.json({ error: "unknown venture" }, { status: 400 });
  }

  const notesDir = path.join(VAULT_ROOT, venture, "Notes");
  let notes: { name: string; mtime: string }[] = [];
  try {
    notes = fs
      .readdirSync(notesDir, { withFileTypes: true })
      .filter((d) => d.isFile() && d.name.endsWith(".md"))
      .map((d) => {
        const st = fs.statSync(path.join(notesDir, d.name));
        return { name: d.name, mtime: st.mtime.toISOString() };
      })
      .sort((a, b) => b.mtime.localeCompare(a.mtime));
  } catch {
    notes = []; // Notes/ doesn't exist yet
  }

  return NextResponse.json({ notes });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { venture, title, content } = body ?? {};

  if (!venture || !getVenture(venture)) {
    return NextResponse.json({ error: "unknown venture" }, { status: 400 });
  }
  if (!title || typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  if (typeof content !== "string" || !content.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const filePath = writeVentureNote(venture, title.trim(), content);
  return NextResponse.json({ path: filePath });
}
