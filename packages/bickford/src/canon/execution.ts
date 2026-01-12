/**
 * Execution Context and Token Streaming
 * TIMESTAMP: 2026-01-12T20:50:00-05:00
 * 
 * Implements execution context hashing and ledger-proofed token streaming
 * for Tier-1 and Tier-2 closures.
 */

import * as crypto from "crypto";
import { ExecutionContext, TokenStreamProof, ISO8601 } from "./types";

/**
 * UPGRADE #6: Create execution context with deterministic hash
 * 
 * Snapshots the complete execution scope for audit trail.
 * The hash provides a deterministic fingerprint of the execution environment.
 */
export function createExecutionContext(params: {
  executionId: string;
  timestamp: ISO8601;
  tenantId: string;
  actorId: string;
  canonRefsSnapshot: string[];
  constraintsSnapshot: string[];
  environment?: Record<string, any>;
}): ExecutionContext {
  // Sort arrays for deterministic hashing
  const sortedCanonRefs = [...params.canonRefsSnapshot].sort();
  const sortedConstraints = [...params.constraintsSnapshot].sort();
  
  // Create deterministic environment hash
  const envString = params.environment 
    ? JSON.stringify(params.environment, Object.keys(params.environment).sort())
    : "{}";
  const environmentHash = crypto
    .createHash("sha256")
    .update(envString)
    .digest("hex");
  
  // Create context hash from all fields
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
  };
}

/**
 * UPGRADE #5: Buffer tokens with ledger proof
 * 
 * Tokens are buffered and only written to output after proving they are
 * authorized by the current ledger state. This prevents unauthorized
 * output from reaching users.
 */
export function bufferTokensWithProof(params: {
  executionId: string;
  streamId: string;
  tokens: string[];
  ledgerState: any;
  authCheck: (tokens: string[], ledgerState: any) => boolean;
  timestamp: ISO8601;
}): TokenStreamProof {
  // Create ledger hash
  const ledgerString = JSON.stringify(params.ledgerState);
  const ledgerHash = crypto
    .createHash("sha256")
    .update(ledgerString)
    .digest("hex");
  
  // Check authorization
  const approved = params.authCheck(params.tokens, params.ledgerState);
  
  // Create proof hash
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

/**
 * Verify token stream proof
 * 
 * Ensures tokens were properly authorized before being released.
 */
export function verifyTokenStreamProof(
  proof: TokenStreamProof,
  expectedLedgerState: any
): { valid: boolean; reason?: string } {
  // Recompute ledger hash
  const ledgerString = JSON.stringify(expectedLedgerState);
  const expectedLedgerHash = crypto
    .createHash("sha256")
    .update(ledgerString)
    .digest("hex");
  
  if (proof.ledgerHash !== expectedLedgerHash) {
    return {
      valid: false,
      reason: "Ledger hash mismatch - state changed during streaming"
    };
  }
  
  // Recompute proof hash
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
    return {
      valid: false,
      reason: "Proof hash invalid - token stream was tampered with"
    };
  }
  
  if (!proof.approved) {
    return {
      valid: false,
      reason: "Tokens were not authorized by ledger state"
    };
  }
  
  return { valid: true };
}

/**
 * Seal chat thread/message (Tier-1 closure)
 * 
 * Marks a thread or message as sealed, making it immutable.
 */
export function sealChatItem(params: {
  itemId: string;
  timestamp: ISO8601;
}): { sealedAt: Date; hash: string } {
  const sealString = `${params.itemId}|${params.timestamp}`;
  const hash = crypto
    .createHash("sha256")
    .update(sealString)
    .digest("hex");
  
  return {
    sealedAt: new Date(params.timestamp),
    hash,
  };
}

/**
 * Finalize chat thread/message (Tier-2 closure)
 * 
 * Marks a thread or message as canonically finalized, the highest level
 * of immutability. Requires previous seal.
 */
export function finalizeChatItem(params: {
  itemId: string;
  sealedAt: Date;
  timestamp: ISO8601;
  canonRefs: string[];
}): { finalized: boolean; hash: string; reason?: string } {
  // Must be sealed first
  const now = new Date(params.timestamp);
  if (!params.sealedAt || params.sealedAt > now) {
    return {
      finalized: false,
      hash: "",
      reason: "Item must be sealed before finalization"
    };
  }
  
  // Must have canon references
  if (params.canonRefs.length === 0) {
    return {
      finalized: false,
      hash: "",
      reason: "Item must reference canon knowledge for finalization"
    };
  }
  
  // Create finalization hash
  const finalString = [
    params.itemId,
    params.sealedAt.toISOString(),
    params.timestamp,
    params.canonRefs.sort().join(","),
  ].join("|");
  
  const hash = crypto
    .createHash("sha256")
    .update(finalString)
    .digest("hex");
  
  return {
    finalized: true,
    hash,
  };
}
