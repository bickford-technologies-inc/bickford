import { rollbackTenantEnv } from "@bickford/runtime/tenantEnvRollback"

export async function POST(req: Request) {
  const { tenantId, reason } = await req.json()

  if (!tenantId) {
    return Response.json({ ok: false }, { status: 400 })
  }

  const entry = rollbackTenantEnv(tenantId, reason)

  return Response.json({ ok: true, entry })
}
