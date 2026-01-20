import crypto from "node:crypto";

import { canonicalHash, signHash } from "@bickford/authority";
import { appendProofLedger } from "@bickford/ledger";

export async function POST(request: Request) {
  const { intent, result } = await request.json();
  const payload = { intent, result };
  const hash = canonicalHash(payload);
  const signature = signHash(hash);

  const entry = appendProofLedger({
    id: crypto.randomUUID(),
    kind: result?.status ?? "LOCKED",
    intentId: intent?.id ?? "UNKNOWN",
    payload,
    authority: "EXECUTION_AUTHORITY",
    hash,
    signature,
    createdAt: new Date().toISOString(),
  });

  return Response.json({
    ...result,
    proof: { hash, signature },
    ledgerEntryId: entry.id,
  });
}
