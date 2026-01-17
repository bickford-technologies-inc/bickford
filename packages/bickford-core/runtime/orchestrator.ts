import { evaluateEnvelope } from "../envelope/telemetry";
import { materializeMaxArtifact } from "../envelope/artifact";
import { StabilitySignal } from "../envelope/invariants";

export async function orchestrate(signal: StabilitySignal) {
  const state = evaluateEnvelope(signal);

  if (state.mode !== "MAX") {
    return {
      mode: "REDUCED",
      action: "HALT_NONESSENTIAL_EXECUTION",
      reason: state.reason,
    };
  }

  return {
    mode: "MAX",
    action: "EXECUTE_FULL_SYSTEM",
    artifact: materializeMaxArtifact(),
  };
}
