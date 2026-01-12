/**
 * Bickford Canon - Public API
 * TIMESTAMP: 2026-01-12T21:35:00Z
 * LOCKED: This is the canonical Bickford decision framework
 * 
 * Mathematical foundation: Minimizes E[Time-to-Value] subject to invariants
 * 
 * Exports:
 * - Types: Core type definitions
 * - Invariants: Hard gates + mechanical enforcement
 * - OPTR: Decision engine with 3 upgrades applied
 * - Promotion: 4-test gate for structural changes
 * - NonInterference: Multi-agent equilibrium checks
 * - Migration: Migration scoring and regression prevention
 * - Runtime: Environment invariant enforcement
 * - Denials: Structured denial persistence (Phase 3: Trust UX)
 */

// Types
export * from "./types";

// Invariants + Authority Enforcement
export * from "./invariants";

// OPTR Decision Engine
export * from "./optr";

// Promotion Gate
export * from "./promotion";

// Non-Interference
export * from "./nonInterference";

// Migration Scoring
export * from "./migration";

// Runtime Environment Validation
export * from "./runtime";

// Denials (Phase 3: Trust UX)
export * from "./denials/persistDeniedDecision";

/**
 * Bickford Canon Version
 */
export const BICKFORD_CANON_VERSION = "1.2.0";
export const BICKFORD_CANON_TIMESTAMP = "2026-01-12T21:35:00Z";

/**
 * Canonical formula (for reference):
 * 
 * π* = argmin_{π ∈ Π_adm(S(K_t))} E[TTV(π) + λC·C(π) + λR·R(π) − λP·log p(π)]
 * 
 * where:
 * - TTV(π) = Time-to-Value under policy π
 * - C(π) = Expected cost
 * - R(π) = Expected risk
 * - p(π) = Success probability
 * - Π_adm = Admissible policy set (satisfies invariants, canon refs, non-interference)
 * - S(K_t) = Structure over knowledge at time t
 * 
 * Invariants enforce:
 * 1. Timestamps mandatory for authority
 * 2. Canon-only execution (authority boundary)
 * 3. Promotion requires 4 tests
 * 4. Non-interference (∀i≠j: ΔE[TTV_j | π_i] ≤ 0)
 * 5. Trust-first denial traces (Phase 3: complete)
 * 6. Session completions are ledger events
 * 
 * Upgrades applied:
 * 1. Mechanical authority enforcement (requireCanonRefs gate)
 * 2. Stable WhyNot taxonomy (DenialReasonCode enum)
 * 3. Fixed OPTR selection bug (cached features)
 * 4. Migration scoring and regression prevention
 * 5. Runtime environment validation (Prisma/Node, Edge isolation)
 * 6. Phase 3: Trust UX (denial ledger, WhyNot API, CI enforcement)
 */
