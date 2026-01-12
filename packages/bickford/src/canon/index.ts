/**
 * Bickford Canon - Public API
 * TIMESTAMP: 2025-12-21T14:41:00-05:00
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

// Execution Context + Token Streaming
export * from "./execution";

/**
 * Bickford Canon Version
 */
export const BICKFORD_CANON_VERSION = "2.0.0"; // Updated for Tier-1/Tier-2 closures
export const BICKFORD_CANON_TIMESTAMP = "2026-01-12T20:50:00-05:00";

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
 * 5. Trust-first denial traces
 * 6. Session completion ledger events
 * 
 * Upgrades applied:
 * 1. Mechanical authority enforcement (requireCanonRefs gate)
 * 2. Stable WhyNot taxonomy (DenialReasonCode enum)
 * 3. Fixed OPTR selection bug (cached features)
 * 4. Denied decision proof persistence
 * 5. Token streaming with ledger proof
 * 6. Execution context hash
 * 7. Canon promotion endpoint
 * 8. OPTR canon knowledge ingestion
 * 9. ConfidenceEnvelope for trust/weight
 */
