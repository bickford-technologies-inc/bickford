export type MarketTelemetry = {
  trustScore: number;
  insuredUsd: number;
  avgTtvRecoveredMs: number;
};

export function globalMarketState(t: MarketTelemetry) {
  return {
    status: t.trustScore > 0.9 ? "DOMINANT" : "EMERGING",
    insured: t.insuredUsd,
    valueRecoveredMs: t.avgTtvRecoveredMs,
  };
}
