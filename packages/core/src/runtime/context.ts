/**
 * Runtime Context with Canon Constraints
 * 
 * Binds canon-loaded knowledge to runtime execution context.
 * Ensures all decisions have access to canonical constraints.
 * 
 * TIMESTAMP: 2026-02-08T00:00:00Z
 * CANONICAL: This is part of Chat v2 execution surface
 */

import { ExecutionMode } from "./mode";

/**
 * Canon constraint loaded into runtime
 */
export interface CanonConstraint {
  id: string;
  kind: "INVARIANT" | "CONSTRAINT" | "DEFINITION";
  content: string;
  level: "CANON" | "PROPOSED" | "EVIDENCE";
  timestamp: string;
}

/**
 * Runtime context with canon-loaded constraints
 */
export interface RuntimeContext {
  mode: ExecutionMode;
  threadId?: string;
  canonConstraints: CanonConstraint[];
  loadedAt: string;
}

/**
 * Create a runtime context with canon constraints
 */
export function createRuntimeContext(
  mode: ExecutionMode,
  canonConstraints: CanonConstraint[],
  threadId?: string
): RuntimeContext {
  return {
    mode,
    threadId,
    canonConstraints,
    loadedAt: new Date().toISOString(),
  };
}

/**
 * Load canon constraints into runtime context.
 * This ensures that all execution decisions are bounded by canon.
 */
export function loadCanonConstraints(
  context: RuntimeContext,
  constraints: CanonConstraint[]
): RuntimeContext {
  return {
    ...context,
    canonConstraints: [...context.canonConstraints, ...constraints],
    loadedAt: new Date().toISOString(),
  };
}

/**
 * Check if context has required canon constraint
 */
export function hasCanonConstraint(
  context: RuntimeContext,
  constraintId: string
): boolean {
  return context.canonConstraints.some((c) => c.id === constraintId);
}

/**
 * Filter constraints by level (CANON only for hard enforcement)
 */
export function getCanonLevelConstraints(
  context: RuntimeContext
): CanonConstraint[] {
  return context.canonConstraints.filter((c) => c.level === "CANON");
}

/**
 * Get all invariants from context (hard gates)
 */
export function getInvariants(context: RuntimeContext): CanonConstraint[] {
  return context.canonConstraints.filter((c) => c.kind === "INVARIANT");
}
