"use strict";
/**
 * Bickford Canon - Core Invariants
 * TIMESTAMP: 2025-12-21T14:41:00-05:00
 * LOCKED: These are CANON-level hard gates
 *
 * Invariants that enforce mathematical correctness.
 * Violations are HARD_FAIL - execution cannot proceed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.INVARIANTS = void 0;
exports.requireCanonRefs = requireCanonRefs;
exports.checkInvariant = checkInvariant;
const types_1 = require("./types");
exports.INVARIANTS = [
    {
        id: "INV_TS_MANDATORY",
        kind: "INVARIANT",
        title: "Timestamps mandatory for authority",
        ts: "2025-12-21T14:41:00-05:00",
        provenance: { source: "repo", ref: "bickford-codex-2025-12-21" },
        level: "CANON",
        severity: "HARD_FAIL",
        statement: "No execution-impacting knowledge may exert authority unless it has a timestamp and provenance.",
        formal: "authority(x) ⇒ has_timestamp(x) ∧ has_provenance(x)",
    },
    {
        id: "INV_CANON_ONLY_EXECUTION",
        kind: "INVARIANT",
        title: "Canon authority boundary",
        ts: "2025-12-21T14:41:00-05:00",
        provenance: { source: "repo", ref: "bickford-codex-2025-12-21" },
        level: "CANON",
        severity: "HARD_FAIL",
        statement: "Any admissible action must cite canon/constraints/invariants; unpromoted evidence cannot expand the admissible set.",
        formal: "a ∈ Π_adm ⇒ cites(CANON) ∧ ¬(EVIDENCE expands Π_adm)",
    },
    {
        id: "INV_PROMOTION_GATE",
        kind: "INVARIANT",
        title: "Promotion requires 4 tests",
        ts: "2025-12-21T14:41:00-05:00",
        provenance: { source: "repo", ref: "bickford-codex-2025-12-21" },
        level: "CANON",
        severity: "HARD_FAIL",
        statement: "Promote to CANON only if resistance, reproducibility, invariant safety, and feasibility impact tests all pass.",
        formal: "Promote(ΔK) ⇔ A∧B∧C∧D",
    },
    {
        id: "INV_NON_INTERFERENCE",
        kind: "INVARIANT",
        title: "Multi-agent non-interference",
        ts: "2025-12-21T14:41:00-05:00",
        provenance: { source: "repo", ref: "bickford-codex-2025-12-21" },
        level: "CANON",
        severity: "HARD_FAIL",
        statement: "An agent action is inadmissible if it increases any other agent's expected Time-to-Value.",
        formal: "∀i≠j: admissible(π_i) ⇒ ΔE[TTV_j | π_i] ≤ 0",
    },
    {
        id: "INV_TRUST_DENIAL_TRACE",
        kind: "INVARIANT",
        title: "Trust-first auditable denial trace",
        ts: "2025-12-21T14:41:00-05:00",
        provenance: { source: "repo", ref: "bickford-codex-2025-12-21" },
        level: "CANON",
        severity: "HARD_FAIL",
        statement: "Every denial must produce a WhyNot trace (reason codes, missing prereqs, violated invariants) and be logged.",
        formal: "deny(a) ⇒ WhyNot(a) ∧ log(WhyNot)",
    },
    {
        id: "INV_SESSION_COMPLETION_LEDGER",
        kind: "INVARIANT",
        title: "Session completions are ledger events",
        ts: "2025-12-21T14:41:00-05:00",
        provenance: { source: "repo", ref: "session-completion-integration" },
        level: "CANON",
        severity: "HARD_FAIL",
        statement: "Every session completion event must be recorded as a ledger event with timestamp, provenance, and outcome.",
        formal: "∀ session_completion(s): ∃ ledger_event(e): e.kind = SESSION_COMPLETION ∧ e.payload = s",
    },
];
/**
 * UPGRADE #1: Mechanical authority boundary enforcement
 *
 * This function MUST be called by every resolver before admitting an action.
 * Enforces INV_CANON_ONLY_EXECUTION by hard-failing if canon refs are missing/invalid.
 */
function requireCanonRefs(action, canonRefsAvailable, _canonStore) {
    // Accept either Action object or actionId string
    const required = typeof action === "string"
        ? [] // If only id is provided, no prerequisites known
        : action.prerequisitesCanonIds ?? [];
    const missingRefs = required.filter((id) => !canonRefsAvailable.includes(id));
    // For now, stub invalidRefs (future: check canonStore for level)
    const invalidRefs = [];
    return missingRefs.length
        ? {
            ok: false,
            missingRefs,
            invalidRefs,
            message: `Missing canon prerequisites: ${missingRefs.join(", ")}`,
        }
        : {
            ok: true,
            missingRefs: [],
            invalidRefs,
            message: "Canon prerequisites satisfied",
        };
}
/**
 * Check if a specific invariant is violated
 */
function checkInvariant(invariant, context) {
    switch (invariant.id) {
        case "INV_TS_MANDATORY":
            if (context.proposedChanges && !context.proposedChanges.ts) {
                return {
                    violated: true,
                    reasonCode: types_1.DenialReasonCode.AUTHORITY_BOUNDARY_FAIL,
                    message: "Proposed change lacks mandatory timestamp",
                };
            }
            break;
        case "INV_CANON_ONLY_EXECUTION":
            if (context.action?.prerequisitesCanonIds) {
                const missing = context.action.prerequisitesCanonIds.filter((id) => !context.canonIds.has(id));
                if (missing.length > 0) {
                    return {
                        violated: true,
                        reasonCode: types_1.DenialReasonCode.MISSING_CANON_PREREQS,
                        message: `Action requires canon IDs: ${missing.join(", ")}`,
                    };
                }
            }
            break;
    }
    return { violated: false };
}
