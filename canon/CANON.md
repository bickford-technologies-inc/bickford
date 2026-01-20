# The Bickford Canon

## Definition

The Bickford Canon is a mathematical decision framework that minimizes Expected Time-to-Value (E[TTV]) subject to invariant constraints.

## Canonical Formula

```
π* = argmin_{π ∈ Π_adm(S(K_t))} E[TTV(π) + λC·C(π) + λR·R(π) − λP·log p(π)]
```

Where:
- **π*** = Optimal policy (decision path)
- **TTV(π)** = Time-to-Value under policy π
- **C(π)** = Expected cost
- **R(π)** = Expected risk  
- **p(π)** = Success probability
- **Π_adm** = Admissible policy set (satisfies all invariants)
- **S(K_t)** = Structure over knowledge at time t

## Five Canonical Invariants

### 1. Timestamp Authority
**Rule:** All authority-bearing references MUST include timestamps

**Enforcement:** Mechanical (requireCanonRefs gate)

**Rationale:** Prevents stale authority from being used as current truth

### 2. Canon-Only Execution
**Rule:** Execution MUST only proceed from canonical references

**Enforcement:** SHA-256 hash verification at runtime

**Rationale:** Prevents arbitrary code execution outside authority boundary

### 3. Promotion Gate (4 Tests)
**Rule:** Structural changes require passing 4 independent tests:
1. Soundness (no false positives)
2. Completeness (catches real cases)
3. Isolation (no side effects)
4. Determinism (same input → same output)

**Enforcement:** Automated test suite

**Rationale:** Prevents premature promotion of unstable code

### 4. Non-Interference
**Rule:** Agent actions MUST NOT degrade other agents' Time-to-Value

**Formula:** ∀i≠j: ΔE[TTV_j | π_i] ≤ 0

**Enforcement:** Pre-execution check via OPTR projection

**Rationale:** Multi-agent equilibrium (prevents adversarial behavior)

### 5. Trust-First Denial Traces
**Rule:** Denial decisions MUST include:
- Stable reason code (enum, not freeform)
- Explicit violated constraint
- Quantified harm (if applicable)

**Enforcement:** Type system + ledger schema

**Rationale:** Explainability + auditability

## Execution Truth Invariant

> An intent is not real unless it can be: **diffed, hashed, signed, replayed, and exported.**

## Authority Hierarchy

```
1. Canon (this document) - Immutable foundation
   ↓
2. Invariants - Hard gates (mechanical enforcement)
   ↓
3. OPTR Engine - Decision optimization
   ↓
4. Ledger - Append-only record
   ↓
5. Execution - Code changes + commits
```

## Upgrades Applied

### Upgrade 1: Mechanical Authority Enforcement
- **Problem:** Soft gates allowed canon bypass
- **Solution:** `requireCanonRefs()` with hard fail
- **Status:** ✅ Deployed

### Upgrade 2: Stable WhyNot Taxonomy
- **Problem:** Freeform denial reasons (not queryable)
- **Solution:** `DenialReasonCode` enum with explicit variants
- **Status:** ✅ Deployed

### Upgrade 3: Fixed OPTR Selection Bug
- **Problem:** Feature extraction called twice (non-deterministic)
- **Solution:** Cache features once, reuse for all paths
- **Status:** ✅ Deployed

## Version History

- **v1.0.0** (2025-12-21) - Initial canonical definition
- Locked at: `2025-12-21T14:41:00-05:00`

## Modification Rules

1. Canon changes require unanimous consent
2. All changes must preserve backward compatibility
3. Timestamp must be updated on any edit
4. Previous versions archived (never deleted)

## Reference Implementation

See `packages/core/src/canon/` for the canonical TypeScript implementation.

## If This Document Changes, All Bets Are Off

The canon is designed to be stable. If fundamental changes are needed, that signals a deeper problem that cannot be solved by editing this document.
