import { Intent, Decision } from "@bickford/types";
import crypto from "crypto";

/**
 * Authorization logic for intent validation and decision
 * Currently validates intent structure and allows valid intents
 * This can be extended with more complex decision logic
 */
export function authorize(input: {
  tenantId: string;
  intent: any;
}): AuthorityDecision {
  // Basic validation
  if (!input || !input.intent) {
    return {
      id: crypto.randomUUID(),
      intent: input?.intent ?? { id: "UNKNOWN", action: "UNKNOWN" },
      outcome: "DENY",
      reason: "Invalid intent: missing action",
      timestamp: new Date().toISOString(),
    };
  }

  // For now, allow all valid intents
  return {
    id: crypto.randomUUID(),
    intent: input.intent,
    outcome: "ALLOW",
    reason: "Intent authorized",
    timestamp: new Date().toISOString(),
  };
}

export type AuthorityDecision = {
  id: string;
  intent: any;
  outcome: "ALLOW" | "DENY";
  reason: string;
  timestamp: string;
};

/**
 * WhyNotTrace
 * Canonical rationale surface.
 * Evaluation-only. No authority. No execution.
 */
export type WhyNotTrace = {
  decisionId: string;
  deniedAt: number;
  reasonCodes: string[];
  narrative?: string;
};

export { canonicalHash } from "./hash";
export { signHash } from "./sign";
export { verifySignature } from "./verify";
