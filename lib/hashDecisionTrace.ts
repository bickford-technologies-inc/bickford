import { createHash } from "crypto";

export function hashDecisionTrace(trace: unknown): string {
  return createHash("sha256").update(JSON.stringify(trace)).digest("hex");
}
