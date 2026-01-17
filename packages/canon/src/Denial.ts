// packages/canon/src/Denial.ts
// MUST export: Denial

/**
 * Canonical Denial.
 * Records an explicit refusal with reason.
 */
export interface Denial {
  actionId: string;
  reason: string;
  timestamp: string;
}
