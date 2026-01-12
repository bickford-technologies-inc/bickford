// Shared type definitions for Bickford ledger system

export type Intent = {
  action: string;
  origin?: string;
  context?: Record<string, any>;
  timestamp?: string;
};

export type Decision = {
  outcome: "ALLOW" | "DENY";
  reason?: string; // Legacy field for backward compatibility with existing code
  timestamp?: string;
  // Non-interference specific fields
  allowed?: boolean;
  canonId?: string;
  rationale?: string; // Detailed rationale for non-interference denials
  violatedAgent?: AgentId;
  deltaTTV?: number;
};

export type LedgerEntry = {
  id: string;
  intent: Intent;
  decision: Decision;
  hash: string;
  createdAt: string;
};

export type AgentId = string;

export interface AgentContext {
  agentId: AgentId;
  ttvBaseline: number; // current expected TTV
}

export interface InterferenceResult {
  allowed: boolean;
  violatedAgent?: AgentId;
  deltaTTV?: number;
  rationale: string;
}
