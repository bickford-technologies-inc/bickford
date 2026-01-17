import { Intent, Decision } from "@bickford/types";
import crypto from "crypto";

/**
 * Authorization logic for intent validation and decision
 * Currently validates intent structure and allows valid intents
 * This can be extended with more complex decision logic
 */
export function authorize(intent: Intent): Decision {
  // Basic validation
  if (!intent || !intent.action) {
    return {
      id: crypto.randomUUID(),
      intent,
      outcome: "DENY",
      reason: "Invalid intent: missing action",
      timestamp: new Date().toISOString(),
    };
  }

  // For now, allow all valid intents
  return {
    id: crypto.randomUUID(),
    intent,
    outcome: "ALLOW",
    reason: "Intent authorized",
    timestamp: new Date().toISOString(),
  };
}
