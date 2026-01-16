"use server";

import { createHash } from "crypto";

export function hashDecisionTrace(trace: unknown): string {
  const canonical = JSON.stringify(trace, Object.keys(trace as object).sort());
  return createHash("sha256").update(canonical).digest("hex");
}
