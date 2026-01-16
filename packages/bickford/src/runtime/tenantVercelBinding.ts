import fs from "fs";

type Binding = {
  vercelProjectId: string;
  orgId: string;
  envPrefix: string;
};

const map = JSON.parse(fs.readFileSync("infra/vercel/tenants.json", "utf8"))
  .tenants as Record<string, Binding>;

export function resolveTenantProject(tenantId: string): Binding {
  const b = map[tenantId];
  if (!b) {
    throw new Error(`No Vercel project bound for tenant ${tenantId}`);
  }
  return b;
}
