// FORCE EMIT (side-effect imports only)
import "./optr";
import "./canon";

// ======================
// PUBLIC CANONICAL API
// ======================

export * from "./canon";

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
export * from "./intent";
export * from "./decision";

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

export type { AgentResult, IntentContext, OptrResult } from "./optr";

export * from "./deniedDecision";
export type { DeniedDecisionPayload } from "./deniedDecision";
export * from "./rubric";

export * from "./intent";
export * from "./canon";

export type { Intent } from "./intent";
export type { WhyNotTrace } from "./canon";

export type {
  Conversation,
  ConversationMessage,
  ConversationMemoryMatch,
  ConversationMemoryOptions,
  ConversationRole,
  ConversationSummary,
  ConversationTraceSummary,
} from "./conversation.js";
