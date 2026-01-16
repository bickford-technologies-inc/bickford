import { scoreAction } from "./optrCanaryScorer";
import { append } from "./ledger";
import { maybeAdvanceRamp } from "./tenantRampController";

export function optrDecide(state, signals) {
  const { action, score } = scoreAction(signals);

  let next = state;
  if (action === "ACCELERATE") {
    next = maybeAdvanceRamp(state);
  } else if (action === "DECELERATE" && state.stageIndex > 0) {
    next = {
      ...state,
      stageIndex: state.stageIndex - 1,
      enteredAt: Date.now(),
    };
  }

  append({
    ts: new Date().toISOString(),
    kind: "DECISION",
    intentId: `optr-canary:${state.tenantId}`,
    commit: "runtime",
    env: state.tenantId,
    details: {
      action,
      score,
      from: state.stageIndex,
      to: next.stageIndex,
      region: state.region,
    },
  });

  return next;
}
