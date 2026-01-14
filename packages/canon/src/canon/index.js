"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BICKFORD_CANON_TIMESTAMP = exports.BICKFORD_CANON_VERSION = void 0;
const workspaceDeps_1 = require("./invariants/workspaceDeps");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const SRC = path_1.default.join(__dirname);
const imports = [];
function collectImports(dir) {
    for (const f of fs_1.default.readdirSync(dir)) {
        const p = path_1.default.join(dir, f);
        if (fs_1.default.statSync(p).isDirectory())
            collectImports(p);
        else if (p.endsWith(".ts")) {
            const c = fs_1.default.readFileSync(p, "utf8");
            for (const m of c.matchAll(/from\s+['"](@bickford\/[^'\"]+)['"]/g)) {
                imports.push(m[1]);
            }
        }
    }
}
collectImports(SRC);
(0, workspaceDeps_1.assertWorkspaceDeps)(path_1.default.resolve(__dirname, "..", ".."), imports);
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
__exportStar(require("./types"), exports);
// Invariants + Authority Enforcement
__exportStar(require("./invariants"), exports);
// OPTR Decision Engine
__exportStar(require("./optr"), exports);
// Promotion Gate
__exportStar(require("./promotion"), exports);
// Promotion Logic
__exportStar(require("./promote"), exports);
// Non-Interference
__exportStar(require("./nonInterference"), exports);
// Execution Context + Token Streaming
__exportStar(require("./execution"), exports);
// Migration Scoring
__exportStar(require("./migration"), exports);
// Runtime Environment Validation
__exportStar(require("./runtime"), exports);
/**
 * Bickford Canon Version
 */
exports.BICKFORD_CANON_VERSION = "1.3.0";
exports.BICKFORD_CANON_TIMESTAMP = "2026-02-08T00:00:00Z";
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
