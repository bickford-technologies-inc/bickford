import { createHash } from "crypto";

/**
 * Computes a SHA-256 hash of the canonical JSON for a DecisionTrace object.
 * This hash is the only valid identity for decisions, executions, and audit artifacts.
 *
 * @param trace - The DecisionTrace object (or any serializable object)
 * @returns {string} 64-character hex string (SHA-256)
 */
export function hashDecisionTrace(trace: unknown): string {
  return createHash("sha256").update(JSON.stringify(trace)).digest("hex");
}
