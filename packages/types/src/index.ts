// FORCE EMIT
import "./optr";
import "./canon";

// PUBLIC API
export * from "./canon";
export * from "./compat";

// Explicitly allowed stable surfaces only
export type { ExecutionResult } from "./ExecutionResult";
export type { ExecutionAdapter } from "./ExecutionAdapter";

export type DeniedDecisionPayload = {
  denied: true;
  ts: string;
  actionId: string;
  tenantId: string;
  reasonCodes: string[];
  message: string;
};

export {};
export * from "./ExecutionAdapter";
export * from "./ExecutionResult";

export type LedgerEntry = {
  id: string;
  threadId: string;
  role: "user" | "assistant" | "system";
  content: string;
  ts: number;

  /**
   * Canonical intent payload associated with this entry.
   * Required by ledgerEntry.ts and execution convergence.
   */
  intent?: {
    id?: string;
    type?: string;
    payload?: unknown;
  };

  /**
   * Canonical decision payload associated with this entry.
   * Required by ledgerEntry.ts and execution convergence.
   */
  decision?: unknown;

  /**
   * Canonical hash for this entry (if present in runtime).
   */
  hash?: string;

  /**
   * Canonical createdAt timestamp (if present in runtime).
   */
  createdAt?: string;
};

export type EdgeContext = {
  runtime: "edge" | "node";
};

// Canonical exports
export * from "./intent";
export * from "./decision";

/**
 * Compat MUST be last to avoid shadowing
 */
export * from "./compat";
