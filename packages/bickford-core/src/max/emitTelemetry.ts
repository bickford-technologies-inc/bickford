import { MaxTelemetry } from "./telemetry";

export function emitMaxTelemetry(
  total: number,
  admissible: number,
  violations: string[],
  deepResearch?: {
    enabled: boolean;
    model?: string;
    background?: boolean;
    maxToolCalls?: number;
    tools?: string[];
  },
): MaxTelemetry {
  return {
    timestamp: Date.now(),
    totalCapabilities: total,
    admissibleActions: admissible,
    reduced: admissible < total,
    violatedInvariants: violations,
    deepResearch,
  };
}
