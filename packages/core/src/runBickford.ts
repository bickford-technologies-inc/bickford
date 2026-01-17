import type { ExecutionAdapter } from "@bickford/types";
import type { Intent, ExecutionResult } from "@bickford/types";
import { executionHash } from "./hash";

export function runBickford(
  intent: Intent,
  adapter: ExecutionAdapter,
): ExecutionResult {
  // FIX: adapter.now(), adapter.emit, adapter.persist do not exist on ExecutionAdapter. Replace or comment out.
  // const start = adapter.now();
  // adapter.emit({ type: "EXECUTION_COMPLETE", payload: { hash } });
  // adapter.persist({ timestamp: start, data: { hash } });

  const outcome = {
    intent,
    executedAt: Date.now(), // Placeholder for the current timestamp
    version: "bickford-core-v1",
  };

  const hash = executionHash(outcome);

  return {
    success: true,
    hash,
    outcome,
  };
}
