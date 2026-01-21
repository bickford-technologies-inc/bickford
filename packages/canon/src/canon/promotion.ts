/**
 * Promotion Gate (False Structural Change Detector)
 * TIMESTAMP: 2025-12-21T14:41:00-05:00
 * LOCKED: Canonical promotion gate implementation
 *
 * Prevents unpromoted evidence from expanding admissible action set.
 * Requires 4 tests: (A) resistance, (B) reproducibility, (C) invariant safety, (D) feasibility impact
 */

import type { PromotionDecision, PromotionTests } from "@bickford/types";

/**
 * Promotion gate decision function
 *
 * All 4 tests must pass for promotion to CANON:
 * A) Resistance: failure was possible; constraints bound the system
 * B) Reproducibility: stable across trials/contexts
 * C) Invariant safety: cannot enable an invariant violation
 * D) Feasibility impact: materially changes Π_adm or scoring
 */
export function promotionGate(args: {
  ts: string;
  itemId: string;
  from: "EVIDENCE" | "PROPOSED";
  tests: PromotionTests;
}): PromotionDecision {
  const { resistance, reproducible, invariantSafe, feasibilityImpact } =
    args.tests;
  const approved =
    resistance && reproducible && invariantSafe && feasibilityImpact;

  return {
    ts: args.ts,
    itemId: args.itemId,
    from: args.from,
    to: approved ? "CANON" : args.from,
    tests: args.tests,
    approved,
    reason: approved
      ? "Promotion approved: all four tests passed (A: resistance, B: reproducibility, C: invariant safety, D: feasibility impact)."
      : generateDenialReason(args.tests),
  };
}

/**
 * Generate detailed reason for promotion denial
 */
function generateDenialReason(tests: PromotionTests): string {
  const failures: string[] = [];

  if (!tests.resistance) {
    failures.push(
      "(A) resistance: no evidence of failure modes or constraints",
    );
  }
  if (!tests.reproducible) {
    failures.push("(B) reproducibility: unstable across trials/contexts");
  }
  if (!tests.invariantSafe) {
    failures.push("(C) invariant safety: could enable invariant violations");
  }
  if (!tests.feasibilityImpact) {
    failures.push(
      "(D) feasibility impact: does not materially change Π_adm",
    );
  }

  return `Promotion denied: failed ${failures.join(
    "; ",
  )}. Keep as evidence (no expansion of admissible action set).`;
}

/**
 * Run automated promotion tests
 * Returns test results for promotion gate decision
 */
export async function runPromotionTests(args: {
  itemId: string;
  evidenceRefs: string[];
  checkResistance: () => Promise<boolean>;
  checkReproducibility: () => Promise<boolean>;
  checkInvariantSafety: () => Promise<boolean>;
  checkFeasibilityImpact: () => Promise<boolean>;
}): Promise<PromotionTests> {
  const [resistance, reproducible, invariantSafe, feasibilityImpact] =
    await Promise.all([
      args.checkResistance(),
      args.checkReproducibility(),
      args.checkInvariantSafety(),
      args.checkFeasibilityImpact(),
    ]);

  return {
    resistance,
    reproducible,
    invariantSafe,
    feasibilityImpact,
    evidenceRefs: args.evidenceRefs,
  };
}
