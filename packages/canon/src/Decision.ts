// packages/canon/src/Decision.ts
// MUST export: Decision

/**
 * Canonical Decision.
 * Records an authorized resolution of an Action.
 */
export interface Decision {
  id: string;
  actionId: string;
  timestamp: string;
}
