import { MaxTelemetry } from "./telemetry";

export function emitMaxTelemetry(
  total: number,
  admissible: number,
  violations: string[],
): MaxTelemetry {
  return {
    timestamp: Date.now(),
    totalCapabilities: total,
    admissibleActions: admissible,
    reduced: admissible < total,
    violatedInvariants: violations,
  };
}
