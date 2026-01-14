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
exports.executeWithCanon = executeWithCanon;
exports.validateExecutionContext = validateExecutionContext;
const types_1 = require("@bickford/types");
const invariants_1 = require("./invariants");
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
