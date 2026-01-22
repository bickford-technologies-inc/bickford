import type { Intent } from "@bickford/types";
import crypto from "node:crypto";

export type { WhyNotTrace } from "@bickford/types";

export type AuthorityDecision = {
  id: string;
  intent: Intent;
  outcome: "ALLOW" | "DENY";
  reason: string;
  timestamp: string;
};

export type AuthorityContext = Record<string, unknown>;

export type AuthorizeInput = {
  intent: Intent;
  tenantId?: string;
  context?: AuthorityContext;
};

export function authorize(input: AuthorizeInput): AuthorityDecision {
  if (!input || !input.intent || !input.intent.action) {
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

export { canonicalHash } from "./hash.js";
export { signHash } from "./sign.js";
export { verifySignature } from "./verify.js";
