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
  ref?: string; // commit SHA, doc path, conversation id
  author?: string; // human or agent identity
  hash?: string; // sha256 of artifact
};

export type CanonLevel = "EVIDENCE" | "PROPOSED" | "CANON";

export type CanonItemBase = {
  id: string;
  title: string;
  ts: ISO8601; // MANDATORY (INV_TS_MANDATORY)
  provenance: Provenance; // MANDATORY (INV_TS_MANDATORY)
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
  prerequisitesCanonIds: string[]; // Gates "second action too early"
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  resourcesUsed?: string[]; // For non-interference check
  sharedStateModified?: string[]; // For non-interference check
};

/**
 * Stable taxonomy for denial reasons
 * UPGRADE #2: WhyNot stable taxonomy
 */
export enum DenialReasonCode {
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
  reasonCodes: DenialReasonCode[]; // STABLE TAXONOMY
  missingCanonIds?: string[];
  violatedInvariantIds?: string[];
  requiredCanonRefs?: string[];
  message: string;
  context?: Record<string, any>;
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
  resistance: boolean; // A: failure was possible
  reproducible: boolean; // B: stable across trials
  invariantSafe: boolean; // C: no invariant violations
  feasibilityImpact: boolean; // D: changes admissible set
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
  ttv: number; // Expected Time-to-Value
  cost: number;
  risk: number;
  successProb: number;
  total: number; // ttv + λC·cost + λR·risk − λP·log(p)
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
  features?: CandidateFeatures; // CACHED during scoring
};

export type OPTRRun = {
  ts: ISO8601;
  tenantId: string;
  goal: string;
  candidates: CandidatePath[];
  selectedPathId?: string;
  selectedNextActionId?: string;
  denyTraces?: WhyNotTrace[];
  canonRefsUsed: string[]; // REQUIRED: authority boundary
};

/**
 * Weights for OPTR objective function
 */
export type OPTRWeights = {
  lambdaC: number; // Cost coefficient
  lambdaR: number; // Risk coefficient
  lambdaP: number; // Success probability coefficient
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
  invalidRefs?: string[]; // Refs that exist but aren't CANON level
  message?: string;
};
