import type { LedgerEntry } from "@bickford/types";

export function toApiLedgerEntry(db: {
  id: string;
  tenantId: string | null;
}): LedgerEntry {
  const entry: LedgerEntry = {
    id: db.id,
    ...(db.tenantId ? { tenantId: db.tenantId } : {}),
  };

  return entry;
}
