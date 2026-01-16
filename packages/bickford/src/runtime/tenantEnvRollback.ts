import { getTenantLedger, appendTenantEnv } from "./tenantEnvLedger";

export function rollbackTenantEnv(
  tenantId: string,
  reason: string,
  actor = "system"
) {
  const ledger = getTenantLedger(tenantId);

  if (ledger.length < 2) {
    throw new Error("No prior env state to roll back to");
  }

  // last entry is bad; previous is known-good
  const bad = ledger.at(-1)!;
  const good = ledger.at(-2)!;

  return appendTenantEnv({
    ts: new Date().toISOString(),
    tenantId,
    kind: "ENV_ROLLBACK",
    key: bad.key,
    scope: bad.scope,
    oldHash: bad.newHash,
    newHash: good.newHash,
    actor,
    intentId: `rollback:${reason}`,
  });
}
