// FORCE EMIT (side-effect imports only)
import "./optr";
import "./canon";

// ======================
// PUBLIC CANONICAL API
// ======================

export * from "./canon";
export * from "./compat";

// Explicitly allowed stable surfaces
export type { ExecutionResult } from "./ExecutionResult";
export type { ExecutionAdapter } from "./ExecutionAdapter";

// ======================
// DENIED DECISION PAYLOAD
// ======================

/**
 * CANONICAL GATE
 * index.ts MUST NOT introduce new surface area.
 * It forwards canon only.
 */
export type DeniedDecisionPayload = {
  decisionId: string;

  // REQUIRED CONTEXT
  actionId: string;
  tenantId: string;

  // DENIAL METADATA
  denied: true;
  reason: string;

  // OPTIONAL TRACEABILITY
  ruleId?: string;
  timestamp?: number;
};

// ======================
// LEDGER TYPES
// ======================

export type LedgerEntry = {
  id: string;
  threadId: string;
  role: "user" | "assistant" | "system";
  content: string;
  ts: number;

  intent?: {
    id?: string;
    type?: string;
    payload?: unknown;
  };

  decision?: unknown;
  hash?: string;
  createdAt?: string;
};

export type EdgeContext = {
  runtime: "edge" | "node";
};

// Canonical intent / decision
export * from "./intent";
export * from "./decision";

/**
 * Compat MUST be last to avoid shadowing
 */
export * from "./compat";

// OPTR SUPPORT TYPES — TEMPORARY CANON SURFACE
// Added to satisfy build; semantics finalized in Phase 2B

export type AgentContext = {
  agentId: string;
  targetId?: string;
};

export type InterferenceResult = {
  allowed: boolean;
  reason?: string;
};

export * from "./deniedDecision";
