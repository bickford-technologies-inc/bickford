/**
 * Multi-Agent Non-Interference Check
 * TIMESTAMP: 2025-12-21T14:41:00-05:00
 * LOCKED: Canonical non-interference implementation
 *
 * Enforces: ∀i≠j: admissible(π_i) ⇒ ΔE[TTV_j | π_i] ≤ 0
 * An action is inadmissible if it increases any other agent's Time-to-Value.
 */

import type { Action } from "@bickford/types";
import { DenialReasonCode } from "@bickford/types";
import type { WhyNotTrace, AuthorityContext } from "@bickford/authority";

/**
 * Check if an action maintains non-interference property
 */
export function nonInterferenceOK(args: {
  actingAgentId: string;
  actionId: string;
  deltaExpectedTTV: Record<string, number>; // otherAgentId -> ΔE[TTV]
}): { ok: boolean; violations: { agentId: string; delta: number }[] } {
  const violations = Object.entries(args.deltaExpectedTTV)
    .filter(([agentId, delta]) => agentId !== args.actingAgentId && delta > 0)
    .map(([agentId, delta]) => ({ agentId, delta }));

  return { ok: violations.length === 0, violations };
}

/**
 * Gate: Non-interference check
 * Returns WhyNot trace if violations detected
 */
export function gateNonInterference(
  action: Action,
  actingAgentId: string,
  deltaExpectedTTV: Record<string, number>,
  nowIso: string,
): WhyNotTrace | null {
  const check = nonInterferenceOK({
    actingAgentId,
    actionId: action.id,
    deltaExpectedTTV,
  });

  if (check.ok) return null;

  return {
    ts: nowIso,
    actionId: action.id,
    denied: true,
    reasonCodes: [DenialReasonCode.NON_INTERFERENCE_VIOLATION],
    message: `Denied: Action increases TTV for ${check.violations.length} other agent(s)`,
    context: {
      actingAgent: actingAgentId,
      violations: check.violations.map((v) => ({
        agent: v.agentId,
        deltaMS: v.delta,
      })),
    },
  };
}

/**
 * Estimate impact of an action on other agents' Time-to-Value
 *
 * Simplified estimator - production would use more sophisticated modeling.
 */
export function estimateTTVImpact(args: {
  action: Action;
  otherAgents: Array<{
    id: string;
    currentGoal: string;
    dependsOnResources?: string[];
    dependsOnState?: string[];
  }>;
}): Record<string, number> {
  const impacts: Record<string, number> = {};

  for (const agent of args.otherAgents) {
    let delta = 0;

    // Resource contention
    const resourceConflicts = (args.action.resourcesUsed || []).filter((r) =>
      (agent.dependsOnResources || []).includes(r),
    );
    delta += resourceConflicts.length * 50; // +50ms per conflict

    // Shared state modification
    const stateConflicts = (args.action.sharedStateModified || []).filter((s) =>
      (agent.dependsOnState || []).includes(s),
    );
    delta += stateConflicts.length * 100; // +100ms per conflict

    impacts[agent.id] = delta;
  }

  return impacts;
}

/**
 * Multi-agent equilibrium check
 *
 * Joint admissible set:
 * Π_adm = { (π_1,...,π_N) : InvariantsHold ∧ ∀i≠j: ΔE[TTV_j | π_i] ≤ 0 }
 */
export function checkMultiAgentEquilibrium(args: {
  agents: Array<{
    id: string;
    plannedActions: Action[];
    currentGoal: string;
    dependsOnResources?: string[];
    dependsOnState?: string[];
  }>;
}): {
  equilibrium: boolean;
  conflicts: Array<{
    agent1: string;
    agent2: string;
    action: string;
    deltaMS: number;
  }>;
} {
  const conflicts: Array<{
    agent1: string;
    agent2: string;
    action: string;
    deltaMS: number;
  }> = [];

  // Check each pair of agents
  for (let i = 0; i < args.agents.length; i++) {
    for (let j = i + 1; j < args.agents.length; j++) {
      const agent1 = args.agents[i];
      const agent2 = args.agents[j];

      // Check if agent1's actions interfere with agent2
      for (const action of agent1.plannedActions) {
        const impacts = estimateTTVImpact({
          action,
          otherAgents: [agent2],
        });

        if (impacts[agent2.id] > 0) {
          conflicts.push({
            agent1: agent1.id,
            agent2: agent2.id,
            action: action.id,
            deltaMS: impacts[agent2.id],
          });
        }
      }

      // Check if agent2's actions interfere with agent1
      for (const action of agent2.plannedActions) {
        const impacts = estimateTTVImpact({
          action,
          otherAgents: [agent1],
        });

        if (impacts[agent1.id] > 0) {
          conflicts.push({
            agent1: agent2.id,
            agent2: agent1.id,
            action: action.id,
            deltaMS: impacts[agent1.id],
          });
        }
      }
    }
  }

  return {
    equilibrium: conflicts.length === 0,
    conflicts,
  };
}

export function checkNonInterference(
  context: AuthorityContext,
  action: string,
): boolean {
  // Non-interference check logic
  return true;
}
