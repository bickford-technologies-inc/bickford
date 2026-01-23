import { getLedger, getPrismaClient } from "@bickford/core/ledger";

export async function GET() {
  // Build / CI / static export guard
  if (
    process.env.VERCEL ||
    process.env.CI ||
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return new Response(JSON.stringify({ entries: [] }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Ensure Prisma client is initialized (for environments that require explicit init)
  getPrismaClient();

  const entries = await getLedger();
  return new Response(JSON.stringify({ entries }), {
    headers: { "Content-Type": "application/json" },
  });
}
