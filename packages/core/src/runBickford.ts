import type { ExecutionAdapter } from "@bickford/types";
import type { Intent, ExecutionResult } from "@bickford/types";
import { executionHash } from "./hash";

export function runBickford(
  intent: Intent,
  adapter: ExecutionAdapter
): ExecutionResult {
  const start = adapter.now();

  const outcome = {
    intent,
    executedAt: start,
    version: "bickford-core-v1",
  };

  const hash = executionHash(outcome);

  adapter.emit({
    type: "EXECUTION_COMPLETE",
    payload: { hash },
  });

  adapter.persist({
    timestamp: start,
    data: { hash },
  });

  return {
    success: true,
    hash,
    outcome,
  };
}
