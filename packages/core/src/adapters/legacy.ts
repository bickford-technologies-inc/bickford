import { Prisma } from "@prisma/client";
import { Intent, Decision } from "@bickford/types";

export function toLegacyIntent(i: Intent): Prisma.JsonObject {
  return {
    ...i,
    action: i.action ?? "UNKNOWN",
    id: i.id ?? "UNKNOWN",
  } as Prisma.JsonObject;
}

export function toLegacyDecision(d: Decision): Prisma.JsonObject {
  const decision = d as Decision & { outcome?: string; timestamp?: string };
  return {
    ...decision,
    intent:
      typeof decision.intent === "string"
        ? { id: decision.intent, action: "UNKNOWN" }
        : toLegacyIntent(decision.intent),
    id: decision.id ?? "UNKNOWN",
    outcome: decision.outcome ?? "UNKNOWN",
    timestamp: decision.timestamp ?? new Date().toISOString(),
  } as Prisma.JsonObject;
}
