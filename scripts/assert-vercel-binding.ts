import { resolveTenantProject } from "../packages/bickford/src/runtime/tenantVercelBinding"

const tenantId = process.env.TENANT_ID
const actualProject = process.env.VERCEL_PROJECT_ID

if (!tenantId || !actualProject) {
  console.error("TENANT_ID and VERCEL_PROJECT_ID required")
  process.exit(1)
}

const { vercelProjectId } = resolveTenantProject(tenantId)

if (actualProject !== vercelProjectId) {
  console.error(
    `❌ Tenant ${tenantId} bound to ${vercelProjectId}, not ${actualProject}`
  )
  process.exit(1)
}

console.log("✅ Tenant ↔ Vercel project binding verified")
