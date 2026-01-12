import { Invariant } from "./types";

export const INVARIANTS: Invariant[] = [
  {
    id: "INV_TS_MANDATORY",
    kind: "INVARIANT",
    title: "Timestamps mandatory for authority",
    ts: "2025-12-21T14:41:00-05:00",
    provenance: { source: "chat" },
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
    provenance: { source: "chat" },
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
    provenance: { source: "chat" },
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
    provenance: { source: "chat" },
    level: "CANON",
    severity: "HARD_FAIL",
    statement:
      "An agent action is inadmissible if it increases any other agent’s expected Time-to-Value.",
    formal:
      "∀i≠j: admissible(π_i) ⇒ ΔE[TTV_j | π_i] ≤ 0"
  },
  {
    id: "INV_TRUST_DENIAL_TRACE",
    kind: "INVARIANT",
    title: "Trust-first auditable denial trace",
    ts: "2025-12-21T14:41:00-05:00",
    provenance: { source: "chat" },
    level: "CANON",
    severity: "HARD_FAIL",
    statement:
      "Every denial must produce a WhyNot trace (reason codes, missing prereqs, violated invariants) and be logged.",
    formal:
      "deny(a) ⇒ WhyNot(a) ∧ log(WhyNot)"
  }
];
