export interface LedgerEvent {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
}

const KEY = "bickford.ledger";

export function readLedger(): LedgerEvent[] {
  return JSON.parse(localStorage.getItem(KEY) || "[]");
}

export function appendLedger(event: Omit<LedgerEvent, "id" | "timestamp">) {
  const next = [
    ...readLedger(),
    {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...event
    }
  ];
  localStorage.setItem(KEY, JSON.stringify(next));
}
