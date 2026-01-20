import { readProofLedger } from "@bickford/ledger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const intentId = searchParams.get("intent");

  if (!intentId) {
    return Response.json([], { status: 400 });
  }

  return Response.json(readProofLedger(intentId));
}
