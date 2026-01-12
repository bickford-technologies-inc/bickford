import { authorize } from "@bickford/authority";
import { appendLedger } from "@bickford/ledger";

export async function POST(req: Request) {
  try {
    const intent = await req.json();
    
    // Validate intent has required fields
    if (!intent || typeof intent !== 'object') {
      return Response.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const decision = authorize(intent);
    const ledgerEntry = await appendLedger(intent, decision);

    return Response.json({ decision, ledgerEntry });
  } catch (error) {
    console.error("Error in /api/execute:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
