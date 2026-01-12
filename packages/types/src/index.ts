// Shared type definitions for Bickford ledger system

export type Intent = {
  action: string;
  context?: Record<string, any>;
  timestamp?: string;
};

export type Decision = {
  outcome: "ALLOW" | "DENY";
  reason?: string;
  timestamp?: string;
};

export type LedgerEntry = {
  id: string;
  intent: Intent;
  decision: Decision;
  hash: string;
  createdAt: string;
};
