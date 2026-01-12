/**
 * Canon Execution Logic
 * 
 * Canonical execution enforcement layer.
 * Ensures all execution is gated by canon constraints.
 * 
 * TIMESTAMP: 2026-02-08T00:00:00Z
 * CANONICAL: This is part of Chat v2 execution surface
 */

import { Action, WhyNotTrace, DenialReasonCode } from "./types";
import { requireCanonRefs } from "./invariants";

/**
 * Execution context with canon refs
 */
export interface ExecutionContext {
  mode: "live" | "replay";
  canonRefsAvailable: string[];
  timestamp: string;
}

/**
 * Execution result
 */
export interface ExecutionResult {
  allowed: boolean;
  action?: Action;
  denyTrace?: WhyNotTrace;
}

/**
 * Execute an action with canon enforcement
 * 
 * @throws Error if canon refs are missing or if in replay mode
 */
export function executeWithCanon(
  action: Action,
  context: ExecutionContext
): ExecutionResult {
  // Hard gate: replay mode cannot execute
  if (context.mode === "replay") {
    return {
      allowed: false,
      denyTrace: {
        ts: context.timestamp,
        actionId: action.id,
        denied: true,
        reasonCodes: [DenialReasonCode.AUTHORITY_BOUNDARY_FAIL],
        message: "Replay mode cannot execute. Replay is side-effect free.",
        context: { mode: context.mode },
      },
    };
  }

  // Enforce canon refs
  const authorityCheck = requireCanonRefs(
    action,
    context.canonRefsAvailable
  );

  if (!authorityCheck.ok) {
    return {
      allowed: false,
      denyTrace: {
        ts: context.timestamp,
        actionId: action.id,
        denied: true,
        reasonCodes: [DenialReasonCode.MISSING_CANON_PREREQS],
        missingCanonIds: authorityCheck.missingRefs,
        requiredCanonRefs: action.prerequisitesCanonIds,
        message: authorityCheck.message || "Missing canon prerequisites",
      },
    };
  }

  // Execution allowed
  return {
    allowed: true,
    action,
  };
}

/**
 * Validate execution context
 */
export function validateExecutionContext(context: ExecutionContext): boolean {
  return (
    context.mode === "live" &&
    Array.isArray(context.canonRefsAvailable) &&
    context.timestamp !== undefined
  );
}
