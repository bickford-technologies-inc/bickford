import { ExecutionResult } from "./types";
import { assertExecutable } from "./invariants";

export async function executeStep(step: string): Promise<ExecutionResult> {
  assertExecutable(step);
  return {
    ok: true,
    output: step,
    ts: Date.now(),
  };
}
