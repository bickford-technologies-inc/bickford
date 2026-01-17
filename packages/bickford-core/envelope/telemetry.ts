import { Envelope } from "./envelope";
import { invariantStable, StabilitySignal } from "./invariants";

export interface EnvelopeTransition {
  from: "MAX" | "REDUCED";
  to: "MAX" | "REDUCED";
  reason: string;
  timestamp: number;
}

export const EnvelopeHistory: EnvelopeTransition[] = [];

export function evaluateEnvelope(signal: StabilitySignal) {
  if (Envelope.mode === "MAX" && !invariantStable(signal)) {
    EnvelopeHistory.push({
      from: "MAX",
      to: "REDUCED",
      reason: "INVARIANT_BREACH",
      timestamp: Date.now(),
    });
    Envelope.mode = "REDUCED";
    Envelope.reason = "Invariant breach detected";
    Envelope.since = Date.now();
  }

  if (Envelope.mode === "REDUCED" && invariantStable(signal)) {
    EnvelopeHistory.push({
      from: "REDUCED",
      to: "MAX",
      reason: "AUTO_RECOVERY",
      timestamp: Date.now(),
    });
    Envelope.mode = "MAX";
    Envelope.reason = undefined;
    Envelope.since = Date.now();
  }

  return Envelope;
}
