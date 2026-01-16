export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { ledger } from "@bickford/core";

export async function GET() {
  // Build / CI / static export guard
  if (
    process.env.VERCEL ||
    process.env.CI ||
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return NextResponse.json({ entries: [] });
  }

  ledger.getPrismaClient();
  const entries = await ledger.getLedger();
  return NextResponse.json({ entries });
}
