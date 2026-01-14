/**
 * @bickford/core - Consolidated Bickford Core Package
 *
 * Combines OPTR engine, Canon authority, Ledger, and Runtime into a single package.
 *
 * Exports:
 * - optr: OPTR decision engine with path scoring and denial tracking
 * - canon: Canon authority with invariants and enforcement
 * - ledger: Append-only ledger for intent-decision pairs
 * - runtime: Chat v2 execution runtime with mode gating
 */

// OPTR Engine
export { resolvePath, selectPolicy } from "./optr";

// Canon Authority
export * as canon from "./canon";

// Ledger
export * as ledger from "./ledger";

// Runtime (Chat v2)
export * as runtime from "./runtime";

// Re-export commonly used items at top level
export { BICKFORD_CANON_VERSION, BICKFORD_CANON_TIMESTAMP } from "./canon";
export * from "./canon";
export * from "./ledger";
export * from "./runtime";
