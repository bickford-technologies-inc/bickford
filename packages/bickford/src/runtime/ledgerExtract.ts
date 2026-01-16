import { getTenantLedger } from "./tenantEnvLedger";

export function extractLedger(
  tenantId: string,
  period: { from: string; to: string }
) {
  return getTenantLedger(tenantId).filter(
    (e) => e.ts >= period.from && e.ts <= period.to
  );
}
