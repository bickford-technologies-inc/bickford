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
} from "@bickford/types";
import { requireCanonRefs } from "./invariants.js";

type ExecutionContextInput = {
  executionId: string;
  timestamp: ISO8601;
  tenantId: string;
  actorId: string;
  canonRefsSnapshot: string[];
  constraintsSnapshot: string[];
  environment: Record<string, unknown>;
};

type LedgerState = {
  seq: number;
  hash: string;
};

type TokenStreamProofInput = {
  executionId: string;
  streamId: string;
  tokens: string[];
  ledgerState: LedgerState;
  authCheck: (tokens: string[], ledgerState: LedgerState) => boolean;
  timestamp: ISO8601;
};

type TokenStreamVerification = {
  valid: boolean;
  reason?: string;
};

type SealResult = {
  sealedAt: Date;
  hash: string;
};

type FinalizeResult = {
  finalized: boolean;
  hash: string;
  reason?: string;
};

function hashSha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function stableStringify(value: Record<string, unknown>): string {
  const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}

export function createExecutionContext(
  input: ExecutionContextInput,
): ExecutionContext {
  const canonRefsSnapshot = [...input.canonRefsSnapshot].sort();
  const constraintsSnapshot = [...input.constraintsSnapshot].sort();
  const environmentHash = hashSha256(stableStringify(input.environment));
  const contextHash = hashSha256(
    [
      input.executionId,
      input.timestamp,
      input.tenantId,
      input.actorId,
      canonRefsSnapshot.join("|"),
      constraintsSnapshot.join("|"),
      environmentHash,
    ].join("::"),
  );

  return {
    executionId: input.executionId,
    timestamp: input.timestamp,
    tenantId: input.tenantId,
    actorId: input.actorId,
    canonRefsSnapshot,
    constraintsSnapshot,
    environmentHash,
    contextHash,
    mode: "live",
    canonRefsAvailable: canonRefsSnapshot,
  };
}

export function bufferTokensWithProof(
  input: TokenStreamProofInput,
): TokenStreamProof {
  const ledgerHash = hashSha256(stableStringify(input.ledgerState));
  const approved = input.authCheck(input.tokens, input.ledgerState);
  const proofHash = hashSha256(
    [
      input.executionId,
      input.streamId,
      input.tokens.join(""),
      ledgerHash,
      approved ? "approved" : "denied",
      input.timestamp,
    ].join("::"),
  );

  return {
    executionId: input.executionId,
    streamId: input.streamId,
    tokens: input.tokens,
    ledgerHash,
    proofHash,
    approved,
    timestamp: input.timestamp,
  };
}

export function verifyTokenStreamProof(
  proof: TokenStreamProof,
  ledgerState: LedgerState,
): TokenStreamVerification {
  const ledgerHash = hashSha256(stableStringify(ledgerState));

  if (ledgerHash !== proof.ledgerHash) {
    return { valid: false, reason: "Ledger hash mismatch" };
  }

  const expectedHash = hashSha256(
    [
      proof.executionId,
      proof.streamId,
      proof.tokens.join(""),
      proof.ledgerHash,
      proof.approved ? "approved" : "denied",
      proof.timestamp,
    ].join("::"),
  );

  if (expectedHash !== proof.proofHash) {
    return { valid: false, reason: "Proof hash mismatch" };
  }

  return { valid: true };
}

export function sealChatItem(args: {
  itemId: string;
  timestamp: ISO8601;
}): SealResult {
  const sealedAt = new Date(args.timestamp);
  const hash = hashSha256(`${args.itemId}::${sealedAt.toISOString()}`);

  return { sealedAt, hash };
}

export function finalizeChatItem(args: {
  itemId: string;
  sealedAt: Date;
  timestamp: ISO8601;
  canonRefs: string[];
}): FinalizeResult {
  if (!args.canonRefs.length) {
    return {
      finalized: false,
      hash: hashSha256(`${args.itemId}::${args.sealedAt.toISOString()}::fail`),
      reason: "Canon refs required for finalization",
    };
  }

  const canonRefs = [...args.canonRefs].sort();
  const hash = hashSha256(
    [
      args.itemId,
      args.sealedAt.toISOString(),
      args.timestamp,
      canonRefs.join("|"),
    ].join("::"),
  );

  return { finalized: true, hash };
}

// Canon-gated execution logic (latest, canonical)
export interface ExecutionResult {
  allowed: boolean;
  action?: Action;
  denyTrace?: WhyNotTrace;
}

export function executeWithCanon(
  action: Action,
  context: ExecutionContext,
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
  const authorityCheck = requireCanonRefs(action, context.canonRefsAvailable);

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
