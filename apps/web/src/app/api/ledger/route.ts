import { NextResponse } from "next/server";
import { getLedger } from "@bickford/core/src/ledger";
import { getPrismaClient } from "@bickford/core/src/ledger/db";

export async function GET() {
  // Build / CI / static export guard
  if (
    process.env.VERCEL ||
    process.env.CI ||
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return NextResponse.json({ entries: [] });
  }

  // Ensure Prisma client is initialized (for environments that require explicit init)
  getPrismaClient();

  const entries = await getLedger();
  return NextResponse.json({ entries });
}
