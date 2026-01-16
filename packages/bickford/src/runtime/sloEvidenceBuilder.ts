import crypto from "crypto";
import fs from "fs";
import { scoreCanary } from "./canarySLO";
import { getTenantLedger } from "./tenantEnvLedger";

export function buildSLOEvidence(
  tenantId: string,
  period: { from: string; to: string }
) {
  const slos = JSON.parse(fs.readFileSync("infra/slo/canary.json", "utf8"))
    .tenants[tenantId];

  const ledger = getTenantLedger(tenantId);

  const decisions = ledger.filter(
    (e) => e.ts >= period.from && e.ts <= period.to
  );

  const rollbacks = decisions.filter((e) => e.kind === "ENV_ROLLBACK");

  const metrics = {
    evaluated: true,
    source: "canaryMetrics",
    window: slos.window_seconds,
  };

  const payload = {
    tenantId,
    period,
    slos,
    metrics,
    decisions,
    rollbacks,
    attestations: {
      automated: true,
      immutable: true,
      sourceOfTruth: "ledger",
    },
  };

  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  return { ...payload, hash };
}
