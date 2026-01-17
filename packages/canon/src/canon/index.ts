import { assertWorkspaceDeps } from "./invariants/workspaceDeps";
import fs from "fs";
import path from "path";

const SRC = path.join(__dirname);
const imports: string[] = [];
function collectImports(dir: string) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) collectImports(p);
    else if (p.endsWith(".ts")) {
      const c = fs.readFileSync(p, "utf8");
      for (const m of c.matchAll(/from\s+['"](@bickford\/[^'\"]+)['"]/g)) {
        imports.push(m[1]);
      }
    }
  }
}
collectImports(SRC);
assertWorkspaceDeps(path.resolve(__dirname, "..", ".."), imports);

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
 * - Execution: Canon-gated execution logic
 */

// Types
export * from "./types";

// Invariants + Authority Enforcement
export { enforceInvariants } from "./invariants";

// OPTR Decision Engine
export { optr } from "./optr";

// Promotion Logic
export { promoteCanon } from "./promote";

// Non-Interference
export { nonInterference } from "./nonInterference";

// Execution Context + Token Streaming
export * from "./execution";

// Migration Scoring
export * from "./migration";

// Runtime Environment Validation
export { runtime } from "./runtime";

/**
 * Bickford Canon Version
 */
export const BICKFORD_CANON_VERSION = "1.3.0";
export const BICKFORD_CANON_TIMESTAMP = "2026-02-08T00:00:00Z";

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
 * 6. Chat v2 execution surface (immutable threads, evidence-bound intents, replay gating)
 * 7. Phase 3 Trust UX (denial ledger, WhyNot API, CI enforcement)
 */
