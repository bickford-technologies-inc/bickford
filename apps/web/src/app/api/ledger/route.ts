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

  // Ensure Prisma client is initialized (for environments that require explicit init)
  ledger.getPrismaClient();

  const entries = await ledger.getLedger();
  return NextResponse.json({ entries });
}
