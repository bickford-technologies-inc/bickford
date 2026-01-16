import { Intent, Decision } from "@bickford/types";

/**
 * Authorization logic for intent validation and decision
 * Currently validates intent structure and allows valid intents
 * This can be extended with more complex decision logic
 */
export function authorize(input: {
  tenantId: string;
  intent: string;
}): AuthorityDecision {
  // Basic validation
  if (!input || !input.intent) {
    return {
      allowed: false,
      reason: "Invalid input",
    };
  }

  // For now, allow all valid intents
  return { allowed: true };
}

export type AuthorityDecision =
  | { allowed: true }
  | { allowed: false; reason: string };

export * from "./index";
