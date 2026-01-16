import crypto from "crypto"
import fs from "fs"

const tenant = process.argv[2]
if (!tenant) {
  console.error("tenantId required")
  process.exit(1)
}

const vars = Object.entries(process.env)
  .filter(([k]) => k.startsWith(`TENANT_${tenant}_`))
  .sort(([a], [b]) => a.localeCompare(b))

const canonical = JSON.stringify(vars)
const hash = crypto.createHash("sha256").update(canonical).digest("hex")

fs.mkdirSync(`infra/env/${tenant}`, { recursive: true })
fs.writeFileSync(`infra/env/${tenant}/env.hash`, hash + "\n")

console.log(`✅ Tenant ${tenant} env hash: ${hash}`)
