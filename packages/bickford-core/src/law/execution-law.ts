export type ExecutionLaw = {
  lawId: string;
  invariantIds: string[];
  penaltyUsd: number;
};

export function enforceLaw(law: ExecutionLaw, violatedInvariant: string) {
  if (law.invariantIds.includes(violatedInvariant)) {
    return {
      enforced: true,
      penaltyUsd: law.penaltyUsd,
    };
  }
  return { enforced: false };
}
