import { resolveTenantProject } from "../packages/bickford/src/runtime/tenantVercelBinding";

const tenantId = process.env.TENANT_ID!;
const { envPrefix } = resolveTenantProject(tenantId);

for (const k of Object.keys(process.env)) {
  if (k.startsWith("TENANT_") && !k.startsWith(envPrefix)) {
    console.error(`❌ Env var ${k} violates tenant prefix ${envPrefix}`);
    process.exit(1);
  }
}

console.log("✅ Tenant env prefix isolation verified");
