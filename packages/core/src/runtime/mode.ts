/**
 * Runtime Execution Mode
 * 
 * Defines execution modes for the Bickford runtime.
 * Core invariant: Replay mode is read-only and cannot execute.
 * 
 * TIMESTAMP: 2026-02-08T00:00:00Z
 * CANONICAL: This is part of Chat v2 execution surface
 */

export type ExecutionMode = "live" | "replay";

/**
 * Runtime mode configuration
 */
export interface RuntimeMode {
  mode: ExecutionMode;
  threadId?: string; // Required for replay mode
}

/**
 * Check if runtime is in live execution mode
 */
export function isLiveMode(mode: ExecutionMode): boolean {
  return mode === "live";
}

/**
 * Check if runtime is in replay mode (read-only)
 */
export function isReplayMode(mode: ExecutionMode): boolean {
  return mode === "replay";
}

/**
 * Assert that execution is allowed (not in replay mode)
 * 
 * @throws Error if mode is "replay"
 */
export function assertExecutionAllowed(mode: ExecutionMode): void {
  if (mode === "replay") {
    throw new Error(
      "INVARIANT VIOLATION: Execution not allowed in replay mode. " +
      "Replay is deterministic, side-effect free, and read-only."
    );
  }
}

/**
 * Gate function: only proceed if in live mode
 * 
 * @throws Error if mode is "replay"
 */
export function requireLiveMode(mode: ExecutionMode): void {
  if (mode !== "live") {
    throw new Error(
      "INVARIANT VIOLATION: Live mode required. " +
      "Current mode: " + mode
    );
  }
}
