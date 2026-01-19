export type DeniedDecisionPayload = {
  // CORE IDENTITY
  decisionId: string;
  actionId: string;
  tenantId: string;

  // DENIAL SEMANTICS
  denied: true;

  // TIMING
  ts: number;

  // HUMAN / SYSTEM EXPLANATION
  message: string;
  reason: string;
  reasonCodes?: string[];

  // OPTIONAL TRACEABILITY
  ruleId?: string;
};
