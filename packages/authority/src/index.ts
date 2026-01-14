import { Intent, Decision } from "@bickford/types";

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
      intent: "DENY",
      timestamp: new Date().toISOString(),
      denied: true,
    };
  }

  // For now, allow all valid intents
  return {
    id: crypto.randomUUID(),
    intent: "ALLOW",
    timestamp: new Date().toISOString(),
  };
}

export * from "./index";
