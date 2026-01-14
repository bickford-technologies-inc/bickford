import { NextResponse } from "next/server";
import { ledger } from "@bickford/core";

export async function GET() {
  // Build / CI / static export guard
  if (
    process.env.NODE_ENV === "production" &&
    process.env.VERCEL_ENV === "preview"
  ) {
    return NextResponse.json(
      { error: "Not available in preview." },
      { status: 403 }
    );
  }

  // Ensure Prisma client is initialized (for environments that require explicit init)
  ledger.getPrismaClient();

  const entries = await ledger.getLedger();
  return NextResponse.json({ entries });
}
