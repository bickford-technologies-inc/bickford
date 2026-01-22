"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalizeChatItem = finalizeChatItem;
exports.sealChatItem = sealChatItem;
exports.verifyTokenStreamProof = verifyTokenStreamProof;
exports.bufferTokensWithProof = bufferTokensWithProof;
exports.createExecutionContext = createExecutionContext;
exports.executeWithCanon = executeWithCanon;
exports.validateExecutionContext = validateExecutionContext;
const crypto_1 = require("crypto");
const types_1 = require("@bickford/types");
const invariants_1 = require("./invariants");
function hashSha256(value) {
    return (0, crypto_1.createHash)("sha256").update(value).digest("hex");
}
function stableStringify(value) {
    const entries = Object.entries(value).sort(([a], [b]) => a.localeCompare(b));
    return JSON.stringify(Object.fromEntries(entries));
}
function createExecutionContext(input) {
    const canonRefsSnapshot = [...input.canonRefsSnapshot].sort();
    const constraintsSnapshot = [...input.constraintsSnapshot].sort();
    const environmentHash = hashSha256(stableStringify(input.environment));
    const contextHash = hashSha256([
        input.executionId,
        input.timestamp,
        input.tenantId,
        input.actorId,
        canonRefsSnapshot.join("|"),
        constraintsSnapshot.join("|"),
        environmentHash,
    ].join("::"));
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
function bufferTokensWithProof(input) {
    const ledgerHash = hashSha256(stableStringify(input.ledgerState));
    const approved = input.authCheck(input.tokens, input.ledgerState);
    const proofHash = hashSha256([
        input.executionId,
        input.streamId,
        input.tokens.join(""),
        ledgerHash,
        approved ? "approved" : "denied",
        input.timestamp,
    ].join("::"));
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
function verifyTokenStreamProof(proof, ledgerState) {
    const ledgerHash = hashSha256(stableStringify(ledgerState));
    if (ledgerHash !== proof.ledgerHash) {
        return { valid: false, reason: "Ledger hash mismatch" };
    }
    const expectedHash = hashSha256([
        proof.executionId,
        proof.streamId,
        proof.tokens.join(""),
        proof.ledgerHash,
        proof.approved ? "approved" : "denied",
        proof.timestamp,
    ].join("::"));
    if (expectedHash !== proof.proofHash) {
        return { valid: false, reason: "Proof hash mismatch" };
    }
    return { valid: true };
}
function sealChatItem(args) {
    const sealedAt = new Date(args.timestamp);
    const hash = hashSha256(`${args.itemId}::${sealedAt.toISOString()}`);
    return { sealedAt, hash };
}
function finalizeChatItem(args) {
    if (!args.canonRefs.length) {
        return {
            finalized: false,
            hash: hashSha256(`${args.itemId}::${args.sealedAt.toISOString()}::fail`),
            reason: "Canon refs required for finalization",
        };
    }
    const canonRefs = [...args.canonRefs].sort();
    const hash = hashSha256([
        args.itemId,
        args.sealedAt.toISOString(),
        args.timestamp,
        canonRefs.join("|"),
    ].join("::"));
    return { finalized: true, hash };
}
function executeWithCanon(action, context) {
    // Hard gate: replay mode cannot execute
    if (context.mode === "replay") {
        return {
            allowed: false,
            denyTrace: {
                ts: context.timestamp,
                actionId: action.id,
                denied: true,
                reasonCodes: [types_1.DenialReasonCode.AUTHORITY_BOUNDARY_FAIL],
                message: "Replay mode cannot execute. Replay is side-effect free.",
                context: { mode: context.mode },
            },
        };
    }
    // Enforce canon refs
    const authorityCheck = (0, invariants_1.requireCanonRefs)(action, context.canonRefsAvailable);
    if (!authorityCheck.ok) {
        return {
            allowed: false,
            denyTrace: {
                ts: context.timestamp,
                actionId: action.id,
                denied: true,
                reasonCodes: [types_1.DenialReasonCode.MISSING_CANON_PREREQS],
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
function validateExecutionContext(context) {
    return (context.mode === "live" &&
        Array.isArray(context.canonRefsAvailable) &&
        context.timestamp !== undefined);
}
