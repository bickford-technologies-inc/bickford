export function explainSlowdown(
  intent: Intent,
  max: number,
  allowed: number,
  failures: { invariant: string; reason: string }[],
): SlowdownExplanation {
  return {
    timestamp: Date.now(),
    intent: intent.objective,
    violatedInvariants: failures.map((f) => ({
      id: f.invariant,
      reason: f.reason,
    })),
    impact: {
      maxActions: max,
      allowedActions: allowed,
    },
  };
}
