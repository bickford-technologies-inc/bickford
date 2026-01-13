/**
<<<<<<< HEAD
 * Canon Execution + Tier-1 / Tier-2 Closure Runtime
 *
 * Combines:
 * - Tier-1 / Tier-2 closure mechanics (seal / finalize)
 * - Deterministic execution context hashing
 * - Ledger-proofed token streaming
 * - Chat v2 canon-gated execution enforcement
 *
 * TIMESTAMP: 2026-02-08T00:00:00Z
 * LOCKED: Canonical execution surface
 */

import * as crypto from "crypto";
import {
  Action,
  WhyNotTrace,
  DenialReasonCode,
  ExecutionContext,
  TokenStreamProof,
  ISO8601,
} from "./types";
import { requireCanonRefs } from "./invariants";

/* ────────────────────────────────────────────────────────────── */
/* Tier-1 / Tier-2: Execution Context Hashing                      */
/* ────────────────────────────────────────────────────────────── */

export function createExecutionContext(params: {
  executionId: string;
   * Canon Execution + Tier-1 / Tier-2 Closure Runtime
   *
   * Combines:
   * - Tier-1 / Tier-2 closure mechanics (seal / finalize)
   * - Deterministic execution context hashing
   * - Ledger-proofed token streaming
   * - Chat v2 canon-gated execution enforcement
   *
   * TIMESTAMP: 2026-02-08T00:00:00Z
   * LOCKED: Canonical execution surface
   */

  import * as crypto from "crypto";
  import {
    Action,
    WhyNotTrace,
    DenialReasonCode,
    ExecutionContext,
    TokenStreamProof,
    ISO8601,
  } from "./types";
  import { requireCanonRefs } from "./invariants";

  // ...existing code for context hashing, token streaming, chat closure...

  // Canon-gated execution logic (latest, canonical)
  export interface ExecutionResult {
    allowed: boolean;
    action?: Action;
    denyTrace?: WhyNotTrace;
  }

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

  export function validateExecutionContext(context: ExecutionContext): boolean {
    return (
      context.mode === "live" &&
      Array.isArray(context.canonRefsAvailable) &&
      context.timestamp !== undefined
    );
  }
}
