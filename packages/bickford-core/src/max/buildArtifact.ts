export function buildMaxArtifact(
  intent: Intent,
  all: Action[],
  admissible: Action[],
  failures: { action: Action; invariant: string }[]
): MaxArtifact {
  return {
    intentId: intent.id,
    timestamp: Date.now(),
    totalActions: all.length,
    admissibleActions: admissible.map(a => a.id),
    rejectedActions: failures.map(f => ({
      action: f.action.id,
      violatedInvariant: f.invariant
    }))
  };
}
