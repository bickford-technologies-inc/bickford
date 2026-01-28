export const runtime = "nodejs";

import { listThreads } from "@bickford/superconductor-ledger";

export async function GET() {
  const threads = await listThreads();
  return new Response(JSON.stringify({ threads }), {
    headers: { "Content-Type": "application/json" },
  });
}
