/**
 * Bickford Canon - Public API (FULL Surface)
 * TIMESTAMP: 2026-02-08T00:00:00Z
 * LOCKED: This is the canonical Bickford decision framework
 *
 * Mathematical foundation: Minimizes E[Time-to-Value] subject to invariants
 *
 * Exports:
 * - Types: Core type definitions
 * - Invariants: Hard gates + mechanical enforcement
 * - OPTR: Decision engine with 3 upgrades applied
 * - Promotion: 4-test gate for structural changes
 * - Promote: Canon promotion logic
 * - NonInterference: Multi-agent equilibrium checks
 * - Migration: Migration scoring and regression prevention
 * - Runtime: Environment invariant enforcement
 * - Execution: Canon-gated execution + Tier-1/Tier-2 closure runtime
 * - Denials: Structured denial persistence (Trust UX)
 */

// Types
// No wildcard exports allowed

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

// Execution Context, Token Streaming, Chat v2 Execution
export * from "./execution";

// Denials (Trust UX)
export * from "./denials/persistDeniedDecision";

/**
 * Bickford Canon Version (AUTHORITATIVE)
 */
export const BICKFORD_CANON_VERSION = "2.1.0";
export const BICKFORD_CANON_TIMESTAMP = "2026-02-08T00:00:00Z";

/**
 * Canonical formula (for reference):
 *
 * π* = argmin_{π ∈ Π_adm(S(K_t))}
 *      E[TTV(π) + λC·C(π) + λR·R(π) − λP·log p(π)]
 *
 * Invariants enforce:
 * 1. Timestamps mandatory for authority
 * 2. Canon-only execution (authority boundary)
 * 3. Promotion requires 4 tests
 * 4. Non-interference (∀i≠j: ΔE[TTV_j | π_i] ≤ 0)
 * 5. Trust-first denial traces
 * 6. Session completions are ledger events
 * 7. Replay cannot execute (Chat v2)
 * 8. Intent cannot exist without evidence (Chat v2)
 * 9. Canon cannot mutate during replay (Chat v2)
 *
 * Upgrades applied:
 * 1. Mechanical authority enforcement (requireCanonRefs gate)
 * 2. Stable WhyNot taxonomy (DenialReasonCode enum)
 * 3. Fixed OPTR selection bug (cached features)
 * 4. Migration scoring and regression prevention
 * 5. Runtime environment validation (Prisma/Node, Edge isolation)
 * 6. Tier-1 / Tier-2 closure mechanics
 * 7. Execution context hashing
 * 8. Token streaming with ledger proof
 * 9. Denied decision persistence (Trust UX)
 */
