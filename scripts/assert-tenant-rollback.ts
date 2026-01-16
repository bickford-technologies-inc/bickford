import { getTenantLedger } from "../packages/bickford/src/runtime/tenantEnvLedger";

const tenants = ["core", "demo", "enterprise"];

for (const t of tenants) {
  const ledger = getTenantLedger(t);
  const last = ledger.at(-1);
  if (last?.kind === "ENV_ROLLBACK") {
    console.log(`↩️  Tenant ${t} rolled back to ${last.newHash}`);
  }
}
