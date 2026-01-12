import { PromotionDecision, PromotionTests } from "./types";

export function promotionGate(args: {
  ts: string;
  itemId: string;
  from: "EVIDENCE" | "PROPOSED";
  tests: PromotionTests;
}): PromotionDecision {
  const { resistance, reproducible, invariantSafe, feasibilityImpact } = args.tests;
  const approved = resistance && reproducible && invariantSafe && feasibilityImpact;

  return {
    ts: args.ts,
    itemId: args.itemId,
    from: args.from,
    to: approved ? "CANON" : args.from,
    tests: args.tests,
    approved,
    reason: approved
      ? "Promotion approved: all four tests passed (resistance, reproducibility, invariant safety, feasibility impact)."
      : "Promotion denied: failed one or more tests; keep as evidence (no expansion of admissible action set)."
  };
}
