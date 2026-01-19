export type ValueLedgerEntry = {
  tenantId: string;
  ttvRecoveredMs: number;
  revenueUsd: number;
  ts: string;
};

export const valueLedger: ValueLedgerEntry[] = [];
