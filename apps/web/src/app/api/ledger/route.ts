import { getLedger } from "@bickford/ledger";

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
