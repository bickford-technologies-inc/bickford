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
};

export type WhyNotTrace = {
  ts: ISO8601;
  actionId: string;
  denied: true;
  reasonCodes: string[];
  missingCanonIds?: string[];
  violatedInvariantIds?: string[];
  requiredCanonRefs?: string[];
  message: string;
};

export type LedgerEvent = {
  id: string;
  ts: ISO8601;
  actor: string;
  tenantId: string;
  kind: "INTENT" | "PLAN" | "ACTION" | "OBSERVATION" | "DENY" | "PROMOTION" | "STRUCTURE_UPDATE";
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

export type CandidatePath = {
  id: string;
  actions: Action[];
  score?: OPTRScore;
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
