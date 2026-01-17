import { AgentContext, InterferenceResult } from "@bickford/types";

/**
 * Returns allowed=false if any other agent's TTV increases
 * Pure, deterministic, testable, replayable
 */
export function evaluateNonInterference(
  actor: AgentContext,
  others: AgentContext[],
  projectedTTV: Record<string, number>
): InterferenceResult {
  for (const agent of others) {
    const before = agent.ttvBaseline;
    const after = projectedTTV[agent.agentId];

    if (after === undefined) continue;

    const delta = after - before;

    if (delta > 0) {
      return {
        allowed: false,
      };
    }
  }

  return {
    allowed: true,
  };
}
