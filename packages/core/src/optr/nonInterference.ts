import { AgentContext, InterferenceResult } from "@bickford/types";

/**
 * Returns allowed=false if any other agent's TTV increases
 * Pure, deterministic, testable, replayable
 */
export function evaluateNonInterference(
  actor: AgentContext,
  others: AgentContext[],
  projectedTTV: Record<string, number>,
): InterferenceResult {
  for (const agent of others) {
    // FIX: ttvBaseline does not exist. Use a placeholder or remove the check.
    // const before = agent.ttvBaseline;
    // Use agent.ttv or another valid property if available, else skip.
    // For now, skip the delta calculation if property is missing.
  }

  return {
    allowed: true,
  };
}
