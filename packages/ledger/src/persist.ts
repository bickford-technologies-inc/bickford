import type { LedgerEntry } from "@bickford/types";

export async function persist(entry: LedgerEntry): Promise<void> {
  // canonical no-op persistence stub
  void entry;
}
