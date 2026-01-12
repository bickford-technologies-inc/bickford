/**
 * Execution Runtime
 * 
 * Enforces the core invariant: Replay cannot execute.
 * All execution operations must be gated by runtime mode.
 * 
 * TIMESTAMP: 2026-02-08T00:00:00Z
 * CANONICAL: This is part of Chat v2 execution surface
 */

import { ExecutionMode, assertExecutionAllowed } from "./mode";

/**
 * Execute an operation, gated by runtime mode.
 * 
 * @throws Error if mode is "replay"
 */
export async function executeOperation<T>(
  mode: ExecutionMode,
  operation: () => Promise<T>
): Promise<T> {
  assertExecutionAllowed(mode);
  return operation();
}

/**
 * Execute an operation synchronously, gated by runtime mode.
 * 
 * @throws Error if mode is "replay"
 */
export function executeOperationSync<T>(
  mode: ExecutionMode,
  operation: () => T
): T {
  assertExecutionAllowed(mode);
  return operation();
}

/**
 * Forbid execution in replay mode (hard gate)
 * Use this before any write operation to database or external system.
 * 
 * @throws Error if mode is "replay"
 */
export function forbidReplayExecution(mode: ExecutionMode): void {
  if (mode === "replay") {
    throw new Error(
      "CANONICAL INVARIANT VIOLATED: Replay mode cannot execute. " +
      "Intent cannot mutate reality. Replay is side-effect free."
    );
  }
}

/**
 * Check if execution is allowed without throwing
 */
export function canExecute(mode: ExecutionMode): boolean {
  return mode === "live";
}
