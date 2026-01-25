import { NextRequest, NextResponse } from "next/server";
// IMPORTANT: Use only Node.js-compatible ledger (no Bun)
import { PrismaLedger } from "@bickford/ledger/prismaLedger";

export const runtime = "nodejs"; // Explicitly set to Node.js runtime
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const ledger = new PrismaLedger();
    // Get compliance data
    const certificate = await ledger.generateCertificate();
    return NextResponse.json({
      success: true,
      certificate,
      timestamp: new Date().toISOString(),
      runtime: "nodejs",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        runtime: "nodejs",
      },
      { status: 500 },
    );
  }
}
