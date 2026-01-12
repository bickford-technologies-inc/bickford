import { authorize } from "@bickford/authority";
import { appendLedger } from "@bickford/ledger";

export async function POST(req: Request) {
  const intent = await req.json();
  const decision = authorize(intent);
  const ledgerEntry = appendLedger(intent, decision);

  return Response.json({ decision, ledgerEntry });
}
