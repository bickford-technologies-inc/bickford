import fs from "fs";
import { windowSamples } from "./canaryMetrics";

type SLO = {
  latency_p95_ms: number;
  error_rate_pct: number;
  availability_pct: number;
  window_seconds: number;
};

const slos = JSON.parse(fs.readFileSync("infra/slo/canary.json", "utf8"))
  .tenants as Record<string, SLO>;

export function scoreCanary(tenantId: string, region: string) {
  const slo = slos[tenantId];
  if (!slo) throw new Error(`No SLO for ${tenantId}`);

  const windowMs = slo.window_seconds * 1000;
  const samples = windowSamples(tenantId, region, windowMs);
  if (samples.length === 0) return { ok: true, reason: "no-data" };

  const latencies = samples.map((s) => s.latencyMs).sort((a, b) => a - b);
  const p95 = latencies[Math.floor(latencies.length * 0.95)];

  const errors = samples.filter((s) => !s.ok).length;
  const errorRate = (errors / samples.length) * 100;
  const availability = 100 - errorRate;

  const ok =
    p95 <= slo.latency_p95_ms &&
    errorRate <= slo.error_rate_pct &&
    availability >= slo.availability_pct;

  return {
    ok,
    metrics: {
      p95,
      errorRate,
      availability,
    },
  };
}
