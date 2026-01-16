import { maybeAdvanceRamp } from "@bickford/runtime/tenantRampController"

export async function POST(req: Request) {
  const state = await req.json() // load current RampState

  const next = maybeAdvanceRamp(state)

  return Response.json({
    ok: true,
    state: next
  })
}
