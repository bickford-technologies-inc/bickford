import crypto from "crypto"
import { appendTenantEnv } from "@bickford/runtime/tenantEnvLedger"

export async function POST(req: Request) {
  const { tenantId, key, value, scope, intentId, actor } = await req.json()

  if (!tenantId) {
    return Response.json({ ok: false, error: "tenantId required" }, { status: 400 })
  }

  const newHash = crypto.createHash("sha256").update(value).digest("hex")

  const entry = appendTenantEnv({
    ts: new Date().toISOString(),
    tenantId,
    kind: "ENV_SET",
    key,
    scope,
    oldHash: null,
    newHash,
    actor,
    intentId
  })

  return Response.json({ ok: true, entry })
}
