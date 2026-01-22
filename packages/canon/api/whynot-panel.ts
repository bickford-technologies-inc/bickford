/**
 * Denied Decision Persistence and WhyNot Panel
 * TIMESTAMP: 2026-01-12T20:50:00-05:00
 * 
 * Implements:
 * - Persistence of denied decision proofs
 * - WhyNot panel data formatting for Trust UX
 */

import * as crypto from "crypto";
import { DenialReasonCode, WhyNotTrace } from "@bickford/types";

/**
 * WhyNot Panel Data
 * 
 * Formatted data structure for Trust UX panel showing denial reasons
 * and violated constraints.
 */
export type WhyNotPanelData = {
  title: string;
  summary: string;
  denialReasons: Array<{
    code: DenialReasonCode;
    description: string;
    severity: "HIGH" | "MEDIUM" | "LOW";
  }>;
  violatedConstraints: Array<{
    id: string;
    type: string;
    message: string;
  }>;
  missingPrerequisites: Array<{
    id: string;
    title: string;
    why: string;
  }>;
  actionDetails: {
    actionId: string;
    timestamp: string;
    context?: Record<string, any>;
  };
  proofHash: string;
};

/**
 * Convert WhyNot trace to panel data for UI display
 */
export function formatWhyNotPanel(trace: WhyNotTrace): WhyNotPanelData {
  const denialReasons = trace.reasonCodes.map(code => ({
    code,
    description: getDenialDescription(code),
    severity: getDenialSeverity(code),
  }));
  
  const violatedConstraints = (trace.violatedInvariantIds || []).map(id => ({
    id,
    type: "INVARIANT",
    message: `Invariant ${id} would be violated`,
  }));
  
  const missingPrerequisites = (trace.missingCanonIds || []).map(id => ({
    id,
    title: `Canon Item ${id}`,
    why: "Required knowledge not yet promoted to CANON level",
  }));
  
  // Create proof hash for audit trail
  const proofString = JSON.stringify({
    actionId: trace.actionId,
    ts: trace.ts,
    reasonCodes: trace.reasonCodes,
    message: trace.message,
  });
  const proofHash = crypto
    .createHash("sha256")
    .update(proofString)
    .digest("hex");
  
  return {
    title: "Action Denied",
    summary: trace.message,
    denialReasons,
    violatedConstraints,
    missingPrerequisites,
    actionDetails: {
      actionId: trace.actionId,
      timestamp: trace.ts,
      context: trace.context,
    },
    proofHash,
  };
}

/**
 * Get human-readable description for denial reason code
 */
function getDenialDescription(code: DenialReasonCode): string {
  switch (code) {
    case DenialReasonCode.MISSING_CANON_PREREQS:
      return "Required canon knowledge is not available. Actions must cite promoted canon items.";
    case DenialReasonCode.INVARIANT_VIOLATION:
      return "This action would violate a system invariant. Invariants are hard gates that cannot be bypassed.";
    case DenialReasonCode.NON_INTERFERENCE_VIOLATION:
      return "This action would increase Time-to-Value for other agents. Multi-agent non-interference is required.";
    case DenialReasonCode.AUTHORITY_BOUNDARY_FAIL:
      return "Authority boundary check failed. All admissible actions must cite canon-level knowledge.";
    case DenialReasonCode.RISK_BOUND_EXCEEDED:
      return "Risk level exceeds configured bounds. This action is too risky under current constraints.";
    case DenialReasonCode.COST_BOUND_EXCEEDED:
      return "Cost exceeds configured bounds. This action is too expensive under current constraints.";
    case DenialReasonCode.SUCCESS_PROB_TOO_LOW:
      return "Success probability is too low. This action is unlikely to succeed under current conditions.";
    default:
      return "Unknown denial reason";
  }
}

/**
 * Get severity level for denial reason
 */
function getDenialSeverity(code: DenialReasonCode): "HIGH" | "MEDIUM" | "LOW" {
  switch (code) {
    case DenialReasonCode.INVARIANT_VIOLATION:
    case DenialReasonCode.AUTHORITY_BOUNDARY_FAIL:
      return "HIGH";
    case DenialReasonCode.MISSING_CANON_PREREQS:
    case DenialReasonCode.NON_INTERFERENCE_VIOLATION:
      return "MEDIUM";
    case DenialReasonCode.RISK_BOUND_EXCEEDED:
    case DenialReasonCode.COST_BOUND_EXCEEDED:
    case DenialReasonCode.SUCCESS_PROB_TOO_LOW:
      return "LOW";
    default:
      return "MEDIUM";
  }
}

/**
 * Persist denied decision proof
 * 
 * Creates a database record for the denied decision with proof hash.
 * Returns the proof record for audit trail.
 */
export function createDeniedDecisionProof(trace: WhyNotTrace): {
  id: string;
  actionId: string;
  reasonCodes: string[];
  missingCanonIds: string[];
  violatedInvariantIds: string[];
  requiredCanonRefs: string[];
  message: string;
  context: any;
  proofHash: string;
  createdAt: string;
} {
  const id = `deny_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Convert reason codes to strings immediately
  const reasonCodesStr = trace.reasonCodes.map(c => c.toString());
  
  // Normalize arrays (undefined -> empty array)
  const missingCanonIds = trace.missingCanonIds || [];
  const violatedInvariantIds = trace.violatedInvariantIds || [];
  
  // Create proof hash using normalized data
  const proofString = JSON.stringify({
    id,
    actionId: trace.actionId,
    ts: trace.ts,
    reasonCodes: reasonCodesStr,
    missingCanonIds,
    violatedInvariantIds,
    message: trace.message,
  });
  const proofHash = crypto
    .createHash("sha256")
    .update(proofString)
    .digest("hex");
  
  return {
    id,
    actionId: trace.actionId,
    reasonCodes: reasonCodesStr,
    missingCanonIds,
    violatedInvariantIds,
    requiredCanonRefs: trace.requiredCanonRefs || [],
    message: trace.message,
    context: trace.context || {},
    proofHash,
    createdAt: trace.ts,
  };
}

/**
 * Verify denied decision proof
 * 
 * Ensures the proof hash matches the stored decision data.
 */
export function verifyDeniedDecisionProof(
  proof: ReturnType<typeof createDeniedDecisionProof>
): { valid: boolean; reason?: string } {
  // Recompute proof hash
  const proofString = JSON.stringify({
    id: proof.id,
    actionId: proof.actionId,
    ts: proof.createdAt,
    reasonCodes: proof.reasonCodes,
    missingCanonIds: proof.missingCanonIds,
    violatedInvariantIds: proof.violatedInvariantIds,
    message: proof.message,
  });
  const expectedHash = crypto
    .createHash("sha256")
    .update(proofString)
    .digest("hex");
  
  if (proof.proofHash !== expectedHash) {
    return {
      valid: false,
      reason: "Proof hash mismatch - decision data was tampered with"
    };
  }
  
  return { valid: true };
}
