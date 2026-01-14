import { NextResponse } from "next/server";
import { getLedger } from "@bickford/ledger";

export async function GET() {
  // Build / CI / static export guard
  if (
    process.env.VERCEL ||
    process.env.CI ||
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return NextResponse.json({ entries: [] });
  }

  const entries = await getLedger();
  return NextResponse.json({ entries });
}
