/**
 * @bickford/core - Consolidated Bickford Core Package
 * 
 * Combines OPTR engine, Canon authority, and Ledger into a single package.
 * 
 * Exports:
 * - optr: OPTR decision engine with path scoring
 * - canon: Canon authority with invariants and enforcement
 * - ledger: Append-only ledger for intent-decision pairs
 */

// OPTR Engine
export * as optr from "./optr";

// Canon Authority
export * as canon from "./canon";

// Ledger
export * as ledger from "./ledger";

// Re-export commonly used items at top level
export { BICKFORD_CANON_VERSION, BICKFORD_CANON_TIMESTAMP } from "./canon";
