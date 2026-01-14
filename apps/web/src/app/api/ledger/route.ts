import { getLedger } from "@bickford/ledger";

// Build-time/CI/Static export guard
if (process.env.VERCEL || process.env.CI || process.env.NEXT_PHASE === 'phase-production-build') {
  export async function GET() {
    return Response.json({ entries: [] });
  }
} else {
  export async function GET() {
    try {
      const ledger = await getLedger();
      return Response.json(ledger);
    } catch (error) {
      console.error("Error in /api/ledger:", error);
      return Response.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
}
