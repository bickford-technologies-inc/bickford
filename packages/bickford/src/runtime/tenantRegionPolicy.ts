import fs from "fs"

type Policy = {
  primary: string
  allowed: string[]
  failover: string[]
}

const policies = JSON.parse(
  fs.readFileSync("infra/routing/tenants.json", "utf8")
).tenants as Record<string, Policy>

export function resolveRegion(
  tenantId: string,
  requested?: string
): string {
  const p = policies[tenantId]
  if (!p) throw new Error(`No region policy for ${tenantId}`)

  if (!requested) return p.primary
  if (!p.allowed.includes(requested)) {
    throw new Error(`Region ${requested} not allowed for ${tenantId}`)
  }
  return requested
}

export function getFailoverRegions(tenantId: string): string[] {
  return policies[tenantId]?.failover ?? []
}
