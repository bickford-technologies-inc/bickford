import { createHash, randomUUID } from "crypto";
import { LedgerEntry, Intent, Decision } from "@bickford/types";

const ledger: LedgerEntry[] = [];

export function appendLedger(intent: Intent, decision: Decision): LedgerEntry {
  const payload = JSON.stringify({ intent, decision });
  const hash = createHash("sha256").update(payload).digest("hex");

  const entry: LedgerEntry = {
    id: randomUUID(),
    intent,
    decision,
    hash,
    createdAt: new Date().toISOString()
  };

  ledger.push(entry);
  return entry;
}

export function getLedger(): LedgerEntry[] {
  return ledger;
}
