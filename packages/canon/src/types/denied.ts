export interface DeniedDecisionPayload {
  decisionId?: string;
  ts: string | number;
  actionId?: string;
  tenantId?: string;
  reasonCodes: string[];
  message: string;
  reason?: string;
  intent?: string;
  context?: Record<string, unknown>;
  appealAuthority?: string;
  humanReviewRequired?: boolean;
}
