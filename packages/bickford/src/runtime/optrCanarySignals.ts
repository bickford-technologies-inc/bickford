import { scoreCanary } from "./canarySLO"

export function buildSignals(
  tenantId: string,
  region: string,
  slo: ReturnType<typeof scoreCanary>,
  history: { rollbacks: number; lastRollbackAt?: number },
  volume: number
) {
  const marginLatency = slo.metrics
    ? (slo.slo.latency_p95_ms - slo.metrics.p95) / slo.slo.latency_p95_ms
    : 0

  const marginError = slo.metrics
    ? (slo.slo.error_rate_pct - slo.metrics.errorRate) / slo.slo.error_rate_pct
    : 0

  const confidence = Math.min(1, volume / 1000)
  const cooldownActive =
    history.lastRollbackAt
      ? Date.now() - history.lastRollbackAt < 900_000
      : false

  return {
    marginLatency,
    marginError,
    trend: "flat",          // plug trend calc here
    volatility: 1.0,        // plug variance calc here
    confidence,
    cooldownActive
  }
}
