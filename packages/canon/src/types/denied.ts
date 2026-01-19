export interface DeniedDecisionPayload {
  decisionId: string;
  ts: number;
  reasonCodes: string[];
  message: string;
  intent: string;
  context?: Record<string, unknown>;
  appealAuthority?: string;
  humanReviewRequired?: boolean;
}
