import { optrDecide } from "@bickford/runtime/optrRampController";
import { buildSignals } from "@bickford/runtime/optrCanarySignals";

export async function POST(req: Request) {
  const { state, slo, history, volume } = await req.json();
  const signals = buildSignals(
    state.tenantId,
    state.region,
    slo,
    history,
    volume
  );
  const next = optrDecide(state, signals);
  return Response.json({ ok: true, state: next });
}
