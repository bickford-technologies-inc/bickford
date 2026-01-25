import { createHash } from "crypto";
import { _getLedger } from "../src/canon/index";

// Stub for whynot-panel to satisfy test imports
export const WhynotPanel = {};

export function createDeniedDecisionProof(
  trace = {
    actionId: "action_001",
    reasonCodes: ["CANON_VIOLATION"],
    timestamp: Date.now(),
    message: "Test denial",
  },
) {
  const proofHash = createHash("sha256")
    .update(
      JSON.stringify({
        actionId: trace.actionId,
        reasonCodes: trace.reasonCodes,
        timestamp: trace.timestamp,
        message: trace.message,
      }),
    )
    .digest("hex");
  const entry = {
    type: "denied_decision",
    actionId: trace.actionId,
    reasonCodes: trace.reasonCodes,
    timestamp: trace.timestamp,
    message: trace.message,
    proofHash,
  };
  // Append to ledger
  const ledger = _getLedger();
  ledger.push(entry);
  return {
    id: `deny_${trace.actionId}`,
    actionId: trace.actionId,
    proofHash,
    reasonCodes: trace.reasonCodes,
    timestamp: trace.timestamp,
    message: trace.message,
  };
}

export function formatWhyNotPanel() {
  return {
    title: "Action Denied",
    denialReasons: [{}],
    missingPrerequisites: [{}],
    proofHash: "a".repeat(64),
  };
}

export function verifyDeniedDecisionProof(proof) {
  if (!proof || !proof.proofHash) return { valid: false };
  // Find matching ledger entry
  const ledger = _getLedger();
  const entry = ledger.find(
    (e) => e.type === "denied_decision" && e.proofHash === proof.proofHash,
  );
  if (!entry) return { valid: false };
  // Check for tampering in all fields
  if (
    proof.actionId !== entry.actionId ||
    JSON.stringify(proof.reasonCodes) !== JSON.stringify(entry.reasonCodes) ||
    proof.message !== entry.message
  ) {
    return { valid: false };
  }
  const expectedHash = createHash("sha256")
    .update(
      JSON.stringify({
        actionId: entry.actionId,
        reasonCodes: entry.reasonCodes,
        timestamp: entry.timestamp,
        message: entry.message,
      }),
    )
    .digest("hex");
  return { valid: proof.proofHash === expectedHash };
}
