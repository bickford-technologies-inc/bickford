import fs from "fs"
import { scoreCanary } from "./canarySLO"
import { append } from "./ledger"
import { RampState } from "./tenantRampState"

const ramp = JSON.parse(
  fs.readFileSync("infra/routing/ramp.json", "utf8")
)

export function maybeAdvanceRamp(
  state: RampState
): RampState {
  const stage = ramp.stages[state.stageIndex]
  const nextStage = ramp.stages[state.stageIndex + 1]

  if (!nextStage) return state // already at 100

  const elapsed =
    (Date.now() - state.enteredAt) / 1000

  if (elapsed < ramp.hold_seconds) return state

  const slo = scoreCanary(state.tenantId, state.region)
  if (!slo.ok) return state

  const next: RampState = {
    ...state,
    stageIndex: state.stageIndex + 1,
    enteredAt: Date.now()
  }

  append({
    ts: new Date().toISOString(),
    kind: "DECISION",
    intentId: `ramp:${state.tenantId}`,
    commit: "runtime",
    env: state.tenantId,
    details: {
      from: stage,
      to: nextStage,
      region: state.region
    }
  })

  return next
}

export function weightsFromRamp(
  primary: string,
  canary: string,
  pct: number
) {
  return {
    [primary]: 100 - pct,
    [canary]: pct
  }
}
