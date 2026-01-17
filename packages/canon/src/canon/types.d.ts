/**
 * Bickford Canon - Core Types
 * TIMESTAMP: 2025-12-21T14:41:00-05:00
 * LOCKED: This is canonical authority - changes require promotion gate
 *
 * Mathematical foundation for Bickford decision framework.
 * Minimizes E[Time-to-Value] subject to invariant constraints.
 */
export type ISO8601 = string;
export type Provenance = {
  source: "chat" | "repo" | "test" | "prod" | "import";
  ref?: string;
  author?: string;
  hash?: string;
};
export type CanonLevel = "EVIDENCE" | "PROPOSED" | "CANON";
export type CanonItemBase = {
  id: string;
  title: string;
  ts: ISO8601;
  provenance: Provenance;
  level: CanonLevel;
  notes?: string;
};
export type Definition = CanonItemBase & {
  kind: "DEFINITION";
  term: string;
  text: string;
};
export type Invariant = CanonItemBase & {
  kind: "INVARIANT";
  statement: string;
  formal?: string;
  severity: "HARD_FAIL" | "SOFT_FAIL";
};
export type Constraint = CanonItemBase & {
  kind: "CONSTRAINT";
  appliesTo: string[];
  rule: string;
};
export type Action = {
  id: string;
  name: string;
  description: string;
  prerequisitesCanonIds: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  resourcesUsed?: string[];
  sharedStateModified?: string[];
};
/**
 * Stable taxonomy for denial reasons
 * UPGRADE #2: WhyNot stable taxonomy
 */
export declare enum DenialReasonCode {
  MISSING_CANON_PREREQS = "MISSING_CANON_PREREQS",
  INVARIANT_VIOLATION = "INVARIANT_VIOLATION",
  NON_INTERFERENCE_VIOLATION = "NON_INTERFERENCE_VIOLATION",
  AUTHORITY_BOUNDARY_FAIL = "AUTHORITY_BOUNDARY_FAIL",
  RISK_BOUND_EXCEEDED = "RISK_BOUND_EXCEEDED",
  COST_BOUND_EXCEEDED = "COST_BOUND_EXCEEDED",
  SUCCESS_PROB_TOO_LOW = "SUCCESS_PROB_TOO_LOW",
}
export type WhyNotTrace = {
  ts: ISO8601;
  actionId: string;
  denied: true;
  reasonCodes: DenialReasonCode[];
  missingCanonIds?: string[];
  violatedInvariantIds?: string[];
  requiredCanonRefs?: string[];
  message: string;
  context?: Record<string, any>;
};
/**
 * Structured denial payload for ledger persistence (Phase 3: Trust UX)
 */
export type DeniedDecisionPayload = {
  ts: ISO8601;
  actionId: string;
  actionName?: string;
  tenantId: string;
  goal?: string;
  reasonCodes: DenialReasonCode[];
  missingCanonIds?: string[];
  violatedInvariantIds?: string[];
  requiredCanonRefs?: string[];
  message: string;
  context?: Record<string, any>;
  optrRunId?: string;
};
export type LedgerEvent = {
  id: string;
  ts: ISO8601;
  actor: string;
  tenantId: string;
  kind:
    | "INTENT"
    | "PLAN"
    | "ACTION"
    | "OBSERVATION"
    | "DENY"
    | "PROMOTION"
    | "STRUCTURE_UPDATE"
    | "SESSION_COMPLETION";
  payload: any;
  provenance: Provenance;
};
export type PromotionTests = {
  resistance: boolean;
  reproducible: boolean;
  invariantSafe: boolean;
  feasibilityImpact: boolean;
  evidenceRefs: string[];
};
export type PromotionDecision = {
  ts: ISO8601;
  itemId: string;
  from: CanonLevel;
  to: CanonLevel;
  tests: PromotionTests;
  approved: boolean;
  reason: string;
};
export type OPTRScore = {
  ttv: number;
  cost: number;
  risk: number;
  successProb: number;
  total: number;
  components: Record<string, number>;
};
/**
 * Cached features per candidate
 * UPGRADE #3: Fix OPTR selection bug
 */
export type CandidateFeatures = {
  ttv: number;
  cost: number;
  risk: number;
  successProb: number;
  nextAction: Action;
};
export type CandidatePath = {
  id: string;
  actions: Action[];
  score?: OPTRScore;
  features?: CandidateFeatures;
};
export type OPTRRun = {
  ts: ISO8601;
  tenantId: string;
  goal: string;
  candidates: CandidatePath[];
  selectedPathId?: string;
  selectedNextActionId?: string;
  denyTraces?: WhyNotTrace[];
  canonRefsUsed: string[];
};
/**
 * Weights for OPTR objective function
 */
export type OPTRWeights = {
  lambdaC: number;
  lambdaR: number;
  lambdaP: number;
};
/**
 * Authority check result
 * UPGRADE #1: Mechanical authority enforcement
 */
export type AuthorityCheckResult = {
  ok: boolean;
  actionId: string;
  canonRefsUsed: string[];
  missingRefs?: string[];
  invalidRefs?: string[];
  message?: string;
};
/**
 * ConfidenceEnvelope: Trust and weight of knowledge
 * UPGRADE #9: Trust/weight metadata for canon knowledge
 */
export type ConfidenceEnvelope = {
  confidence: number;
  trust: number;
  weight?: number;
  sourceRefs?: string[];
};
/**
 * ExecutionContext: Snapshot of scope for each execution
 * UPGRADE #6: Execution context hash for deterministic scope tracking
 */
export interface ExecutionContext {
  executionId: string;
  timestamp: ISO8601;
  tenantId: string;
  actorId: string;
  canonRefsSnapshot: string[];
  constraintsSnapshot: string[];
  environmentHash: string;
  contextHash: string;
  mode: "live" | "replay";
  canonRefsAvailable: string[];
}
/**
 * TokenStreamProof: Ledger proof for token streaming
 * UPGRADE #5: Token streaming with ledger proof
 */
export type TokenStreamProof = {
  executionId: string;
  streamId: string;
  tokens: string[];
  ledgerHash: string;
  proofHash: string;
  approved: boolean;
  timestamp: ISO8601;
};
/**
 * PromotionRequest: Request for canon knowledge promotion
 * UPGRADE #7: Canon promotion endpoint
 */
export type PromotionRequest = {
  itemId: string;
  from: CanonLevel;
  to: CanonLevel;
  evidenceRefs: string[];
  reason: string;
  requestedBy: string;
  requestedAt: ISO8601;
};
/**
 * PathConstraint: Constraint derived from canon knowledge for OPTR
 * UPGRADE #8: OPTR ingestion of canon knowledge
 */
export type PathConstraint = {
  id: string;
  canonRefId: string;
  constraintType:
    | "PREREQUISITE"
    | "RISK_BOUND"
    | "COST_BOUND"
    | "TIME_BOUND"
    | "RESOURCE_LIMIT";
  appliesTo: string[];
  params: Record<string, any>;
  confidence: ConfidenceEnvelope;
};
