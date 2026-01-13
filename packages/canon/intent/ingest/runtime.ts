import { normalizeIntent } from "../normalize";
import { Intent } from "../types";

// Runtime ingestion: parse error/log/alert, normalize, and emit Intent
export function ingestFromRuntime(event: any): Intent {
  return normalizeIntent({
    goal: event.goal || event.message || "Runtime signal",
    constraints: event.constraints || [],
    canonRefs: event.canonRefs || [],
    urgency: event.urgency || "high",
    source: "runtime",
    evidence: event,
    createdAt: event.timestamp || new Date().toISOString(),
  });
}
