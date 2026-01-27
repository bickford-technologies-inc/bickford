type JsonValue =
  | string
  | number
  | boolean
  | { [x: string]: JsonValue }
  | Array<JsonValue>
  | null;
type JsonObject = { [Key in string]?: JsonValue };
import { Intent, Decision } from "@bickford/types";

export function toLegacyIntent(i: Intent): JsonObject {
  return {
    ...i,
    action: i.action ?? "UNKNOWN",
    id: i.id ?? "UNKNOWN",
  } as JsonObject;
}

export function toLegacyDecision(d: Decision): JsonObject {
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
  } as JsonObject;
}
