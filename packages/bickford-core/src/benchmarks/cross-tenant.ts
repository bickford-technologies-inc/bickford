export type TenantMetric = {
  trustScore: number;
  ttvRecoveredMs: number;
};

export function benchmark(ms: TenantMetric[]) {
  const avgTrust = ms.reduce((s, m) => s + m.trustScore, 0) / ms.length;
  const avgTtv = ms.reduce((s, m) => s + m.ttvRecoveredMs, 0) / ms.length;
  return { avgTrust, avgTtv };
}
