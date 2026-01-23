import { readProofLedger } from "@bickford/ledger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const intentId = searchParams.get("intent");

  if (!intentId) {
    return Response.json(
      { error: "Missing intent query parameter." },
      { status: 400 },
    );
  }

  const entries = readProofLedger(intentId);
  const payload = {
    intentId,
    exportedAt: new Date().toISOString(),
    entries,
  };
  const filename = `decision-trace-${intentId}.json`;

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
