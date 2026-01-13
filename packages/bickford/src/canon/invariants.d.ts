/**
 * Bickford Canon - Core Invariants
 * TIMESTAMP: 2025-12-21T14:41:00-05:00
 * LOCKED: These are CANON-level hard gates
 *
 * Invariants that enforce mathematical correctness.
 * Violations are HARD_FAIL - execution cannot proceed.
 */
import { Invariant, DenialReasonCode, Action } from "./types";
export declare const INVARIANTS: Invariant[];
/**
 * UPGRADE #1: Mechanical authority boundary enforcement
 *
 * This function MUST be called by every resolver before admitting an action.
 * Enforces INV_CANON_ONLY_EXECUTION by hard-failing if canon refs are missing/invalid.
 */
export declare function requireCanonRefs(action: Action | string, canonRefsAvailable: string[], _canonStore?: unknown): {
    ok: boolean;
    missingRefs: string[];
    invalidRefs?: string[];
    message: string;
};
/**
 * Check if a specific invariant is violated
 */
export declare function checkInvariant(invariant: Invariant, context: {
    action?: any;
    canonIds: Set<string>;
    proposedChanges?: any;
}): {
    violated: boolean;
    reasonCode?: DenialReasonCode;
    message?: string;
};
