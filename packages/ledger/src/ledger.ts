import type { LedgerEntry } from "@bickford/types";

export type Ledger = {
  append(entry: LedgerEntry): Promise<void>;
};

export type ThreadSummary = {
  threadId: string;
  lastUpdatedTs: number;
};

export function writeThread(threadId: string, entries: LedgerEntry[]): void {
  // canonical no-op implementation
  // real persistence is delegated elsewhere
  void threadId;
  void entries;
}

export function listThreads(): ThreadSummary[] {
  // canonical empty implementation
  return [];
}

export function appendLedger(threadId: string, entry: LedgerEntry): void {
  // canonical append shim
  writeThread(threadId, [entry]);
}
