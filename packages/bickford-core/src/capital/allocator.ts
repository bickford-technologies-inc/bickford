export type AllocationTarget = {
  name: string;
  expectedTtvRecoveryMs: number;
  risk: number;
};

export function allocateCapital(
  budgetUsd: number,
  targets: AllocationTarget[],
) {
  return targets
    .filter((t) => t.risk <= 0.1)
    .sort((a, b) => b.expectedTtvRecoveryMs - a.expectedTtvRecoveryMs)
    .map((t) => ({
      target: t.name,
      allocationUsd: Math.round(budgetUsd * 0.6),
    }))[0];
}
