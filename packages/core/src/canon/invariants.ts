/**
 * Bickford Canon - Core Invariants
 * TIMESTAMP: 2025-12-21T14:41:00-05:00
 * LOCKED: These are CANON-level hard gates
 * 
 * Invariants that enforce mathematical correctness.
 * Violations are HARD_FAIL - execution cannot proceed.
 */

import { Invariant, CanonLevel, AuthorityCheckResult, DenialReasonCode } from "./types.js";

export const INVARIANTS: Invariant[] = [
  {
    id: "INV_TS_MANDATORY",
    kind: "INVARIANT",
    title: "Timestamps mandatory for authority",
    ts: "2025-12-21T14:41:00-05:00",
    provenance: { source: "repo", ref: "bickford-codex-2025-12-21" },
    level: "CANON",
    severity: "HARD_FAIL",
    statement:
      "No execution-impacting knowledge may exert authority unless it has a timestamp and provenance.",
    formal:
      "authority(x) ⇒ has_timestamp(x) ∧ has_provenance(x)"
  },
  {
    id: "INV_CANON_ONLY_EXECUTION",
    kind: "INVARIANT",
    title: "Canon authority boundary",
    ts: "2025-12-21T14:41:00-05:00",
    provenance: { source: "repo", ref: "bickford-codex-2025-12-21" },
    level: "CANON",
    severity: "HARD_FAIL",
    statement:
      "Any admissible action must cite canon/constraints/invariants; unpromoted evidence cannot expand the admissible set.",
    formal:
      "a ∈ Π_adm ⇒ cites(CANON) ∧ ¬(EVIDENCE expands Π_adm)"
  },
  {
    id: "INV_PROMOTION_GATE",
    kind: "INVARIANT",
    title: "Promotion requires 4 tests",
    ts: "2025-12-21T14:41:00-05:00",
    provenance: { source: "repo", ref: "bickford-codex-2025-12-21" },
    level: "CANON",
    severity: "HARD_FAIL",
    statement:
      "Promote to CANON only if resistance, reproducibility, invariant safety, and feasibility impact tests all pass.",
    formal:
      "Promote(ΔK) ⇔ A∧B∧C∧D"
  },
  {
    id: "INV_NON_INTERFERENCE",
    kind: "INVARIANT",
    title: "Multi-agent non-interference",
    ts: "2025-12-21T14:41:00-05:00",
    provenance: { source: "repo", ref: "bickford-codex-2025-12-21" },
    level: "CANON",
    severity: "HARD_FAIL",
    statement:
      "An agent action is inadmissible if it increases any other agent's expected Time-to-Value.",
    formal:
      "∀i≠j: admissible(π_i) ⇒ ΔE[TTV_j | π_i] ≤ 0"
  },
  {
    id: "INV_TRUST_DENIAL_TRACE",
    kind: "INVARIANT",
    title: "Trust-first auditable denial trace",
    ts: "2025-12-21T14:41:00-05:00",
    provenance: { source: "repo", ref: "bickford-codex-2025-12-21" },
    level: "CANON",
    severity: "HARD_FAIL",
    statement:
      "Every denial must produce a WhyNot trace (reason codes, missing prereqs, violated invariants) and be logged.",
    formal:
      "deny(a) ⇒ WhyNot(a) ∧ log(WhyNot)"
  },
  {
    id: "INV_SESSION_COMPLETION_LEDGER",
    kind: "INVARIANT",
    title: "Session completions are ledger events",
    ts: "2025-12-21T14:41:00-05:00",
    provenance: { source: "repo", ref: "session-completion-integration" },
    level: "CANON",
    severity: "HARD_FAIL",
    statement:
      "Every session completion event must be recorded as a ledger event with timestamp, provenance, and outcome.",
    formal:
      "∀ session_completion(s): ∃ ledger_event(e): e.kind = SESSION_COMPLETION ∧ e.payload = s"
  }
];

/**
 * UPGRADE #1: Mechanical authority boundary enforcement
 * 
 * This function MUST be called by every resolver before admitting an action.
 * Enforces INV_CANON_ONLY_EXECUTION by hard-failing if canon refs are missing/invalid.
 */
export function requireCanonRefs(
  actionId: string,
  canonRefsUsed: string[],
  canonStore: Map<string, { level: CanonLevel }>
): AuthorityCheckResult {
  // Check empty refs
  if (canonRefsUsed.length === 0) {
    return {
      ok: false,
      actionId,
      canonRefsUsed: [],
      missingRefs: [],
      message: `Authority boundary violation: action "${actionId}" cites zero canon refs. All admissible actions must cite CANON.`
    };
  }

  // Check each ref exists and is CANON level
  const missingRefs: string[] = [];
  const invalidRefs: string[] = [];

  for (const refId of canonRefsUsed) {
    const item = canonStore.get(refId);
    if (!item) {
      missingRefs.push(refId);
    } else if (item.level !== "CANON") {
      invalidRefs.push(refId);
    }
  }

  const ok = missingRefs.length === 0 && invalidRefs.length === 0;

  return {
    ok,
    actionId,
    canonRefsUsed,
    missingRefs: missingRefs.length ? missingRefs : undefined,
    invalidRefs: invalidRefs.length ? invalidRefs : undefined,
    message: ok
      ? undefined
      : `Authority boundary violation: ${missingRefs.length} missing refs, ${invalidRefs.length} non-CANON refs`
  };
}

/**
 * Check if a specific invariant is violated
 */
export function checkInvariant(
  invariant: Invariant,
  context: {
    action?: any;
    canonIds: Set<string>;
    proposedChanges?: any;
  }
): { violated: boolean; reasonCode?: DenialReasonCode; message?: string } {
  switch (invariant.id) {
    case "INV_TS_MANDATORY":
      if (context.proposedChanges && !context.proposedChanges.ts) {
        return {
          violated: true,
          reasonCode: DenialReasonCode.AUTHORITY_BOUNDARY_FAIL,
          message: "Proposed change lacks mandatory timestamp"
        };
      }
      break;

    case "INV_CANON_ONLY_EXECUTION":
      if (context.action?.prerequisitesCanonIds) {
        const missing = context.action.prerequisitesCanonIds.filter(
          (id: string) => !context.canonIds.has(id)
        );
        if (missing.length > 0) {
          return {
            violated: true,
            reasonCode: DenialReasonCode.MISSING_CANON_PREREQS,
            message: `Action requires canon IDs: ${missing.join(", ")}`
          };
        }
      }
      break;
  }

  return { violated: false };
}
