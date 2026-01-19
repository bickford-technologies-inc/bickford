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
  ts: string;
  reasonCodes: string[];
  message: string;
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
