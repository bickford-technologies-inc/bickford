export type LedgerEntry = {
  ts: number;
  agentId: string;
  intent: string;
  proposal: string;
};

const LEDGER: LedgerEntry[] = [];

export function append(entry: LedgerEntry) {
  LEDGER.push(entry);
}

export function all() {
  return LEDGER;
}
