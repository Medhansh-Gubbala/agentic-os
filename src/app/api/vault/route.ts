import { NextResponse } from "next/server";
import { listVentures } from "@/lib/vault";

export async function GET() {
  return NextResponse.json(listVentures());
}
