/**
 * Canon Promotion Logic
 * Handles promotion of canon items from EVIDENCE -> PROPOSED -> CANON.
 * Enforces 4-test promotion gate.
 * TIMESTAMP: 2026-02-08T00:00:00Z
 * CANONICAL: This is part of Chat v2 execution surface
 */

import type { ExecutionResult } from "./types";

/**
 * Promote a canon item to a higher level
 */
export function promoteCanonItem(
  item: CanonItemBase,
  targetLevel: CanonLevel,
  tests: PromotionTests,
): PromotionDecision {
  const decision: PromotionDecision = {
    ts: new Date().toISOString(),
    itemId: item.id,
    from: item.level,
    to: targetLevel,
    tests,
    approved: false,
    reason: "",
  };

  // Canonical promotion gate: all tests must be true
  const allPassed =
    tests.resistance &&
    tests.reproducible &&
    tests.invariantSafe &&
    tests.feasibilityImpact;

  if (!allPassed) {
    decision.approved = false;
    decision.reason = "One or more promotion tests failed";
    return decision;
  }

  // Promotion allowed
  decision.approved = true;
  decision.reason = "All promotion tests passed";
  return decision;
}

/**
 * Validate promotion path: EVIDENCE -> PROPOSED -> CANON
 * Cannot skip levels
 */
export function validatePromotionPath(
  from: CanonLevel,
  to: CanonLevel,
): boolean {
  const levels: CanonLevel[] = ["EVIDENCE", "PROPOSED", "CANON"];
  const fromIdx = levels.indexOf(from);
  const toIdx = levels.indexOf(to);

  // Must be exactly one level up
  return toIdx === fromIdx + 1;
}

/**
 * Create promotion tests result
 */
export function createPromotionTests(
  resistance: boolean,
  reproducible: boolean,
  invariantSafe: boolean,
  feasibilityImpact: boolean,
  evidenceRefs: string[],
): PromotionTests {
  return {
    resistance,
    reproducible,
    invariantSafe,
    feasibilityImpact,
    evidenceRefs,
  };
}

export function promoteCanon(input: unknown): ExecutionResult {
  return {
    status: "promoted",
    input,
  };
}
