/**
 * @bickford/core - Consolidated Bickford Core Package
 * 
 * Combines OPTR engine, Canon authority, Ledger, and Runtime into a single package.
 * 
 * Exports:
 * - optr: OPTR decision engine with path scoring and denial tracking
 * - canon: Canon authority with invariants and enforcement
 * - ledger: Append-only ledger for intent-decision pairs
 * - runtime: Runtime execution with mechanical denial (Phase 3: Trust UX)
 */

// OPTR Engine
export * as optr from "./optr";

// Canon Authority
export * as canon from "./canon";

// Ledger
export * as ledger from "./ledger";

// Runtime (Phase 3: Trust UX)
export * as runtime from "./runtime";

// Re-export commonly used items at top level
export { BICKFORD_CANON_VERSION, BICKFORD_CANON_TIMESTAMP } from "./canon";
