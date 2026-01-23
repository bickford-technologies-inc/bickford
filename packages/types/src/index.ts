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
  timestamp?: number;
  workflow?: string;
  intent?: unknown;
  agentResults?: AgentResult[];
  selectedOptr?: AgentResult;
  commitHash?: string;
  previousHash?: string;
  hash?: string;
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

export interface AgentResult {
  agent: "codex" | "claude" | "copilot" | "mscopilot";
  output: unknown;
  admissible: boolean;
  ttvEstimate: number;
  invariants: string[];
  executionTime: number;
  hash: string;
  timestamp: number;
}

export interface IntentContext {
  workflow: string;
  intent: unknown;
  constraints: string[];
  metadata?: Record<string, unknown>;
}

export * from "./deniedDecision.js";
export * from "./rubric.js";

export type { Intent } from "./intent.js";

export type { Action, WhyNotTrace } from "./canon.js";
export type { ExecutionContext } from "./canon.js";
export type { TokenStreamProof } from "./canon.js";
export type { ISO8601 } from "./canon.js";
export type { CandidatePath } from "./canon.js";
export type { CandidateFeatures } from "./canon.js";
export type { PathConstraint } from "./canon.js";

export type {
  Conversation,
  ConversationMessage,
  ConversationTraceSummary,
} from "./conversation.js";

export type { OPTRScore } from "./canon.js";
export type { OPTRRun } from "./canon.js";
export type { OPTRWeights } from "./canon.js";

export type { AuthorityCheckResult } from "./canon.js";
export type { ConfidenceEnvelope } from "./canon.js";

export type { PromotionDecision, PromotionTests } from "./canon.js";
