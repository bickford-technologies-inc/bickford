import type { LedgerEntry, Intent, Decision } from "@bickford/types";

export function toApiLedgerEntry(db: {
  id: string;
  tenantId: string | null;
  intent: Intent;
  decision: Decision;
  hash: string;
  createdAt: Date;
}): LedgerEntry {
  const entry: LedgerEntry = {
    id: db.id,
    intent: db.intent,
    decision: db.decision,
    hash: db.hash,
    createdAt: db.createdAt.toISOString(),
    ...(db.tenantId ? { tenantId: db.tenantId } : {}),
  };
  return entry;
}
