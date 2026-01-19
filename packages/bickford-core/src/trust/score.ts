export type TrustSignal = {
  invariantViolations30d: number;
  meanTtvDeltaMs: number;
  autoFixRate: number;
};

export function computeTrust(s: TrustSignal): number {
  const v = Math.max(0, 1 - s.invariantViolations30d / 10);
  const t = Math.max(0, 1 - s.meanTtvDeltaMs / 300_000);
  const a = s.autoFixRate;
  return Number((0.4 * v + 0.4 * t + 0.2 * a).toFixed(3));
}
