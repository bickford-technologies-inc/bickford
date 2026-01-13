// Ledger persistence for all decisions (intent, decision, path, denial, deployment, rollback)
import { Intent } from "../packages/bickford/intent/types";

export interface LedgerEntry {
  intentId: string;
  decision: string;
  pathChosen: string;
  allowed: boolean;
  evidence?: any;
  timestamp: string;
  hash: string;
}

export async function persistLedgerEntry(entry: LedgerEntry) {
  // Placeholder: In production, this would write to the canonical ledger (DB, file, etc.)
  console.log("[LEDGER]", JSON.stringify(entry));
}
