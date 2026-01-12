/**
 * Bickford - Decision Continuity Runtime
 * TIMESTAMP: 2026-01-12T03:06:00Z
 * 
 * Production-grade TypeScript core with:
 * - Append-only, hash-linked ledger
 * - Explicit execution intent, authorization, and denial
 * - Deterministic behavior
 * - Strict typing
 * - No hidden state
 * 
 * Usage:
 * ```typescript
 * import { BickfordRuntime } from '@bickford/canon';
 * 
 * const runtime = new BickfordRuntime();
 * const result = runtime.execute({
 *   goal: "Deploy feature X",
 *   tenantId: "tenant-123",
 *   actor: "user-456",
 *   candidatePaths: [...],
 *   canonRefsUsed: ["INV_CANON_ONLY_EXECUTION"]
 * });
 * ```
 */

// Core Runtime
export * from "./runtime";

// Canon Framework (types, invariants, OPTR, promotion, non-interference)
export * from "./canon";

// Version
export const BICKFORD_VERSION = "1.0.0";
export const BICKFORD_TIMESTAMP = "2026-01-12T03:06:00Z";
