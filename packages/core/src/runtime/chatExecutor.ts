/**
 * Chat Executor Runtime
 * 
 * Enforces execution mode invariants for chat operations.
 * Replay mode is read-only and must never trigger execution.
 */

export type ExecutionMode = "normal" | "replay";

export interface ChatExecutorConfig {
  mode: ExecutionMode;
}

/**
 * Execute a chat operation.
 * 
 * @throws Error if mode is "replay" - replay mode is read-only
 */
export function executeChatOperation(
  config: ChatExecutorConfig,
  operation: () => Promise<void>
): Promise<void> {
  if (config.mode === "replay") {
    throw new Error(
      "INVARIANT VIOLATION: Cannot execute operations in replay mode. " +
      "Replay mode is side-effect free and read-only."
    );
  }

  return operation();
}

/**
 * Assert that we are NOT in replay mode.
 * Use this guard before any write operations.
 */
export function assertNotReplayMode(mode: ExecutionMode): void {
  if (mode === "replay") {
    throw new Error(
      "INVARIANT VIOLATION: Operation not allowed in replay mode. " +
      "Replay mode is side-effect free and read-only."
    );
  }
}
