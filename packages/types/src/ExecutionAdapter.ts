// packages/types/src/ExecutionAdapter.ts
// MUST export: ExecutionAdapter

/**
 * Canonical execution adapter interface.
 * Structural contract only — no behavior, no policy.
 */
export interface ExecutionAdapter<Input = unknown, Output = unknown> {
  execute(input: Input): Promise<Output>;
}
