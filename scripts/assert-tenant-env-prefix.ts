const fs = require("fs");
const path = require("path");

function loadTenantConfig() {
  const configPath = path.join(process.cwd(), "infra", "vercel", "tenants.json");
  const raw = fs.readFileSync(configPath, "utf8");
  return JSON.parse(raw);
}

function assertTenantEnvPrefix() {
  const tenantId = process.env.TENANT_ID;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;

  if (!tenantId) {
    throw new Error("TENANT_ID is required for tenant env prefix validation.");
  }

  const config = loadTenantConfig();
  const tenant = config?.tenants?.[tenantId];

  if (!tenant) {
    throw new Error(`No tenant configuration found for ${tenantId}.`);
  }

  if (!tenant.envPrefix) {
    throw new Error(`Missing envPrefix for tenant ${tenantId}.`);
  }

  const expectedPrefix = `TENANT_${tenantId.toUpperCase()}_`;
  if (tenant.envPrefix !== expectedPrefix) {
    throw new Error(
      `Env prefix mismatch for ${tenantId}. Expected ${expectedPrefix}, found ${tenant.envPrefix}.`,
    );
  }

  if (vercelProjectId && tenant.vercelProjectId !== vercelProjectId) {
    throw new Error(
      `Vercel project mismatch for ${tenantId}. Expected ${tenant.vercelProjectId}, got ${vercelProjectId}.`,
    );
  }
}

assertTenantEnvPrefix();
