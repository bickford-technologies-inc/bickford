import { buildBundle } from "@bickford/runtime/auditBundleBuilder"

export async function POST(req: Request) {
  const { tenantId, from, to } = await req.json()
  const zip = await buildBundle(
    tenantId,
    { from, to }
  )

  return Response.json({
    ok: true,
    bundle: zip
  })
}
