import type { ExecutionResult } from "./types";

export function promoteCanon(input: unknown): ExecutionResult {
  return {
    status: "promoted",
    input,
  };
}
