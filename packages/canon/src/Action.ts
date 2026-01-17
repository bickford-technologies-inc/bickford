// packages/canon/src/Action.ts
// MUST export: Action

/**
 * Canonical Action.
 * Represents an intended operation, not execution.
 */
export interface Action {
  id: string;
  type: string;
  payload?: unknown;
}
