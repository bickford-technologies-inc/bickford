/**
 * Denied Decision Persistence (Trust UX)
 * Canon Stub — Implementation follows
 */

export interface DeniedDecisionRecord {
  actionId: string;
  reasonCodes: string[];
  message: string;
  timestamp: string;
}

export function persistDeniedDecision(_: DeniedDecisionRecord): void {
  // append-only persistence, implemented later
}
