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
  return {
    ...d,
    intent:
      typeof d.intent === "string"
        ? { id: d.intent, action: "UNKNOWN" }
        : toLegacyIntent(d.intent),
    id: d.id ?? "UNKNOWN",
    outcome: d.outcome ?? "UNKNOWN",
    timestamp: d.timestamp ?? new Date().toISOString(),
  } as Prisma.JsonObject;
}
