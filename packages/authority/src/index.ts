import { Intent, Decision } from "@bickford/types";
import crypto from "crypto";
export type { WhyNotTrace } from "@bickford/types";
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

export type { WhyNotTrace } from "@bickford/types";

export { canonicalHash } from "./hash.js";
export { signHash } from "./sign.js";
export { verifySignature } from "./verify.js";
