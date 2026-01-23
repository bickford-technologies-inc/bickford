// FORCE EMIT (side-effect imports only)
import "./optr";
import "./canon";

// ======================
// PUBLIC CANONICAL API
// ======================

export * from "./canon.js";

// Explicitly allowed stable surfaces
export type { ExecutionResult } from "./ExecutionResult.js";

export type { HardwareAttestation } from "./HardwareAttestation.js";

// ======================
// LEDGER TYPES
// ======================

export type ExecutionEvent = {
  id: string;
  timestamp: string;
};

export type LedgerEntry = {
  id: string;
  event: ExecutionEvent;
};

export type ExecutionAdapter = {
  runtime: "node" | "edge";
};

// Canonical intent / decision
export * from "./intent.js";
export * from "./decision.js";

/**
 * Compat MUST be last to avoid shadowing
 */
// export * from "./compat.js";

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

export * from "./deniedDecision.js";
export * from "./rubric.js";

export type {
  Conversation,
  ConversationMessage,
  ConversationSummary,
  ConversationTraceSummary,
} from "./conversation.js";
