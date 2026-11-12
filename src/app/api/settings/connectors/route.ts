import { NextResponse } from "next/server";
import fs from "fs";
import { execSync } from "child_process";
import { claudeBin } from "@/lib/conductor";

function claudeResolvable(bin: string): boolean {
  if (bin !== "claude") return fs.existsSync(bin);
  // bin fell back to bare "claude" — confirm PATH actually resolves it.
  try {
    execSync("command -v claude", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    linear: !!process.env.LINEAR_API_KEY,
    google: !!process.env.GOOGLE_OAUTH_JSON,
    claude: claudeResolvable(claudeBin()),
  });
}
