export type ComputeUnit = {
  unitId: string;
  costUsdPerMin: number;
  meanTtvRecoveryMs: number;
};

export function priceByValue(units: ComputeUnit[]) {
  return units.map((u) => ({
    unitId: u.unitId,
    priceUsd: Number(
      ((u.meanTtvRecoveryMs / 60_000) * u.costUsdPerMin * 1.2) // value premium
        .toFixed(4),
    ),
  }));
}
