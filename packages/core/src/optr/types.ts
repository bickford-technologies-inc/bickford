// CORE OPTR AUTHORITY TYPES (LOCAL ONLY)
// This file is the single source of truth for OPTR types in @bickford/core
// No imports from @bickford/canon are allowed here.

//
// ─────────────────────────────────────────────────────────────
// Action + Candidate Path
// ─────────────────────────────────────────────────────────────
//

export interface Action {
  id: string;
  name?: string;
  description?: string;

  // Canon / readiness constraints
  prerequisitesCanonIds?: string[];

  // Optional risk metadata
  riskLevel?: number;
}

export interface CandidatePath {
  id: string;
  actions: Action[];

  features?: CandidateFeatures;
  score?: OPTRScore;
}

//
// ─────────────────────────────────────────────────────────────
// Feature Extraction
// ─────────────────────────────────────────────────────────────
//

export interface CandidateFeatures {
  ttv: number;
  cost: number;
  risk: number;
  successProb: number;
  nextAction?: Action;
}

//
// ─────────────────────────────────────────────────────────────
// OPTR Scoring
// ─────────────────────────────────────────────────────────────
//

export interface OPTRScore {
  ttv: number;
  cost: number;
  risk: number;
  successProb: number;

  total: number;

  components: {
    ttv: number;
    cost: number;
    risk: number;
    prob: number;
  };
}

export interface OPTRWeights {
  lambdaC: number;
  lambdaR: number;
  lambdaP: number;
}

//
// ─────────────────────────────────────────────────────────────
// Denial / Why-Not Tracing
// ─────────────────────────────────────────────────────────────
//

export enum DenialReasonCode {
  MISSING_CANON_PREREQS = "MISSING_CANON_PREREQS",
  AUTHORITY_BOUNDARY_FAIL = "AUTHORITY_BOUNDARY_FAIL",
  RISK_BOUND_EXCEEDED = "RISK_BOUND_EXCEEDED",
  COST_BOUND_EXCEEDED = "COST_BOUND_EXCEEDED",
}

export interface WhyNotTrace {
  ts: string;
  actionId: string;
  denied: boolean;
  reasonCodes: DenialReasonCode[];

  missingCanonIds?: string[];
  requiredCanonRefs?: string[];

  message: string;
}

//
// ─────────────────────────────────────────────────────────────
// OPTR Run Container
// ─────────────────────────────────────────────────────────────
//

export interface OPTRRun {
  id: string;
  candidates: CandidatePath[];
  selected?: CandidatePath;

  weights: OPTRWeights;
}
