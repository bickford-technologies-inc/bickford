import type { MonitorabilityInvariantInput } from "./types";
import { MONITORABILITY_THRESHOLDS } from "./thresholds";

export interface InvariantResult {
  ok: boolean;
  reason?: string;
}

export const MONITORABILITY_INVARIANT = {
  id: "MONITORABILITY_MINIMUM_ENFORCED",
  description:
    "High-impact decisions must meet minimum monitorability thresholds",

  assert(input: MonitorabilityInvariantInput): InvariantResult {
    const { assessment, impact } = input;
    const threshold = MONITORABILITY_THRESHOLDS.find(
      (t) => t.impact === impact,
    );

    if (!threshold) {
      return { ok: false, reason: `Unknown impact: ${impact}` };
    }
    if (assessment.gMeanSquared < threshold.minimumGMean) {
      return {
        ok: false,
        reason: `Monitorability too low for ${impact}. Required: ${threshold.minimumGMean}, Actual: ${assessment.gMeanSquared.toFixed(3)}`,
      };
    }
    if (!threshold.allowedSurfaces.includes(assessment.surface)) {
      return {
        ok: false,
        reason: `Surface \"${assessment.surface}\" not allowed for ${impact}`,
      };
    }
    if (impact === "HIGH" && assessment.surface === "INPUT_ONLY") {
      return {
        ok: false,
        reason: "HIGH impact requires reasoning visibility",
      };
    }
    return { ok: true };
  },
};
