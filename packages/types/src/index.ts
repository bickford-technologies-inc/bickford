export type Origin = "human" | "agent";

export interface Intent {
  action: string;
  params?: Record<string, any>;
  origin: Origin;
}

export interface Decision {
  allowed: boolean;
  canonId: string;
  rationale: string;
  timestamp: string;
}

export interface LedgerEntry {
  id: string;
  intent: Intent;
  decision: Decision;
  hash: string;
  createdAt: string;
}
