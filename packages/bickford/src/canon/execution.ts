/**
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
  timestamp: ISO8601;
  tenantId: string;
  actorId: string;
  canonRefsSnapshot: string[];
  constraintsSnapshot: string[];
  environment?: Record<string, any>;
}): ExecutionContext {
  const sortedCanonRefs = [...params.canonRefsSnapshot].sort();
  const sortedConstraints = [...params.constraintsSnapshot].sort();

  const envString = params.environment
    ? JSON.stringify(params.environment, Object.keys(params.environment).sort())
    : "{}";

  const environmentHash = crypto
    .createHash("sha256")
    .update(envString)
    .digest("hex");

  const contextString = [
    params.executionId,
    params.timestamp,
    params.tenantId,
    params.actorId,
    sortedCanonRefs.join(","),
    sortedConstraints.join(","),
    environmentHash,
  ].join("|");

  const contextHash = crypto
    .createHash("sha256")
    .update(contextString)
    .digest("hex");

  return {
    executionId: params.executionId,
    timestamp: params.timestamp,
    tenantId: params.tenantId,
    actorId: params.actorId,
    canonRefsSnapshot: sortedCanonRefs,
    constraintsSnapshot: sortedConstraints,
    environmentHash,
    contextHash,
    mode: "live",
    canonRefsAvailable: sortedCanonRefs,
  };
}

/* ────────────────────────────────────────────────────────────── */
/* Tier-1 / Tier-2: Ledger-Proofed Token Streaming                 */
/* ────────────────────────────────────────────────────────────── */

export function bufferTokensWithProof(params: {
  executionId: string;
  streamId: string;
  tokens: string[];
  ledgerState: any;
  authCheck: (tokens: string[], ledgerState: any) => boolean;
  timestamp: ISO8601;
}): TokenStreamProof {
  const ledgerHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(params.ledgerState))
    .digest("hex");

  const approved = params.authCheck(params.tokens, params.ledgerState);

  const proofString = [
    params.executionId,
    params.streamId,
    params.tokens.join(""),
    ledgerHash,
    approved.toString(),
    params.timestamp,
  ].join("|");

  const proofHash = crypto
    .createHash("sha256")
    .update(proofString)
    .digest("hex");

  return {
    executionId: params.executionId,
    streamId: params.streamId,
    tokens: params.tokens,
    ledgerHash,
    proofHash,
    approved,
    timestamp: params.timestamp,
  };
}

export function verifyTokenStreamProof(
  proof: TokenStreamProof,
  expectedLedgerState: any
): { valid: boolean; reason?: string } {
  const expectedLedgerHash = crypto
    .createHash("sha256")
    .update(JSON.stringify(expectedLedgerState))
    .digest("hex");

  if (proof.ledgerHash !== expectedLedgerHash) {
    return { valid: false, reason: "Ledger hash mismatch" };
  }

  const proofString = [
    proof.executionId,
    proof.streamId,
    proof.tokens.join(""),
    proof.ledgerHash,
    proof.approved.toString(),
    proof.timestamp,
  ].join("|");

  const expectedProofHash = crypto
    .createHash("sha256")
    .update(proofString)
    .digest("hex");

  if (proof.proofHash !== expectedProofHash) {
    return { valid: false, reason: "Proof hash mismatch" };
  }

  if (!proof.approved) {
    return { valid: false, reason: "Tokens not authorized" };
  }

  return { valid: true };
}

/* ────────────────────────────────────────────────────────────── */
/* Tier-1 / Tier-2: Chat Closure                                   */
/* ────────────────────────────────────────────────────────────── */

export function sealChatItem(params: { itemId: string; timestamp: ISO8601 }): {
  sealedAt: Date;
  hash: string;
} {
  const hash = crypto
    .createHash("sha256")
    .update(`${params.itemId}|${params.timestamp}`)
    .digest("hex");

  return { sealedAt: new Date(params.timestamp), hash };
}

export function finalizeChatItem(params: {
  itemId: string;
  sealedAt: Date;
  timestamp: ISO8601;
  canonRefs: string[];
}): { finalized: boolean; hash: string; reason?: string } {
  if (params.canonRefs.length === 0) {
    return {
      finalized: false,
      hash: "",
      reason: "Finalization requires canon references",
    };
  }

  const finalString = [
    params.itemId,
    params.sealedAt.toISOString(),
    params.timestamp,
    params.canonRefs.sort().join(","),
  ].join("|");

  const hash = crypto.createHash("sha256").update(finalString).digest("hex");

  return { finalized: true, hash };
}

/* ────────────────────────────────────────────────────────────── */
/* Chat v2: Canon-Gated Execution                                  */
/* ────────────────────────────────────────────────────────────── */

export interface ExecutionResult {
  allowed: boolean;
  action?: Action;
  denyTrace?: WhyNotTrace;
}

export function executeWithCanon(
  action: Action,
  context: ExecutionContext
): ExecutionResult {
  if (context.mode === "replay") {
    return {
      allowed: false,
      denyTrace: {
        ts: context.timestamp,
        actionId: action.id,
        denied: true,
        reasonCodes: [DenialReasonCode.AUTHORITY_BOUNDARY_FAIL],
        message: "Replay mode is side-effect free",
        context: { mode: context.mode },
      },
    };
  }

  const authority = requireCanonRefs(action, context.canonRefsAvailable);

  if (!authority.ok) {
    return {
      allowed: false,
      denyTrace: {
        ts: context.timestamp,
        actionId: action.id,
        denied: true,
        reasonCodes: [DenialReasonCode.MISSING_CANON_PREREQS],
        missingCanonIds: authority.missingRefs,
        requiredCanonRefs: action.prerequisitesCanonIds,
        message: authority.message,
      },
    };
  }

  return { allowed: true, action };
}

export function validateExecutionContext(context: ExecutionContext): boolean {
  return (
    context.mode === "live" &&
    Array.isArray(context.canonRefsAvailable) &&
    typeof context.timestamp === "string"
  );
}
