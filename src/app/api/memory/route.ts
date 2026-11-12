import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { VAULT_ROOT, getVenture } from "@/lib/vault";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { venture, agent, text } = body ?? {};

  if (typeof venture !== "string" || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "venture and text are required" }, { status: 400 });
  }
  if (!getVenture(venture)) {
    return NextResponse.json({ error: `unknown venture: ${venture}` }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);
  const singleLine = text.replace(/\r?\n+/g, "; ").trim();
  const line = `- ${today} — (via OS, ${typeof agent === "string" ? agent : "agent"}) ${singleLine}`;

  const memPath = path.join(VAULT_ROOT, venture, "Memory", "MEMORY.md");
  let content = "";
  try {
    content = fs.readFileSync(memPath, "utf8");
  } catch {
    content = "";
  }

  const heading = `## ${today}`;
  const headingIdx = content.indexOf(heading);
  if (headingIdx !== -1) {
    // append-only: insert the new line right after the existing heading line,
    // never touching any line already in the file.
    const nlIdx = content.indexOf("\n", headingIdx);
    const afterHeadingLine = nlIdx === -1 ? content.length : nlIdx + 1;
    content = content.slice(0, afterHeadingLine) + line + "\n" + content.slice(afterHeadingLine);
  } else {
    const sep = content.trim().length ? "\n\n" : "";
    content = content.trimEnd() + sep + `${heading}\n${line}\n`;
  }

  fs.mkdirSync(path.dirname(memPath), { recursive: true });
  fs.writeFileSync(memPath, content, "utf8");

  return NextResponse.json({ line });
}
