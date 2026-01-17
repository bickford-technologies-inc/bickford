import { AgentContext, InterferenceResult } from "@bickford/types";

/**
 * Returns allowed=true (placeholder, as AgentContext has no ttvBaseline)
 * Pure, deterministic, testable, replayable
 */
export function evaluateNonInterference(
  actor: AgentContext,
  others: AgentContext[],
  projectedTTV: Record<string, number>
): InterferenceResult {
  // No ttvBaseline in AgentContext, so always allow
  return {
    allowed: true,
  };
}
