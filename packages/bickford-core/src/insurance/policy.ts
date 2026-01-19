export type InsurancePolicy = {
  invariantId: string;
  maxLossUsd: number;
  premiumUsd: number;
  covered: true;
};

export function underwrite(
  violations30d: number,
  blastRadius: number,
): InsurancePolicy {
  const premium = Number((blastRadius * 10 + violations30d * 2).toFixed(2));
  return {
    invariantId: "CANON_CORE",
    maxLossUsd: 250_000,
    premiumUsd: premium,
    covered: premium < 50,
  };
}
