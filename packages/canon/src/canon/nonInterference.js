"use strict";
/**
 * Multi-Agent Non-Interference Check
 * TIMESTAMP: 2025-12-21T14:41:00-05:00
 * LOCKED: Canonical non-interference implementation
 *
 * Enforces: ∀i≠j: admissible(π_i) ⇒ ΔE[TTV_j | π_i] ≤ 0
 * An action is inadmissible if it increases any other agent's Time-to-Value.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nonInterferenceOK = nonInterferenceOK;
exports.gateNonInterference = gateNonInterference;
exports.estimateTTVImpact = estimateTTVImpact;
exports.checkMultiAgentEquilibrium = checkMultiAgentEquilibrium;
const types_1 = require("./types");
/**
 * Check if an action maintains non-interference property
 */
function nonInterferenceOK(args) {
    const violations = Object.entries(args.deltaExpectedTTV)
        .filter(([agentId, delta]) => agentId !== args.actingAgentId && delta > 0)
        .map(([agentId, delta]) => ({ agentId, delta }));
    return { ok: violations.length === 0, violations };
}
/**
 * Gate: Non-interference check
 * Returns WhyNot trace if violations detected
 */
function gateNonInterference(action, actingAgentId, deltaExpectedTTV, nowIso) {
    const check = nonInterferenceOK({
        actingAgentId,
        actionId: action.id,
        deltaExpectedTTV,
    });
    if (check.ok)
        return null;
    return {
        ts: nowIso,
        actionId: action.id,
        denied: true,
        reasonCodes: [types_1.DenialReasonCode.NON_INTERFERENCE_VIOLATION],
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
function estimateTTVImpact(args) {
    const impacts = {};
    for (const agent of args.otherAgents) {
        let delta = 0;
        // Resource contention
        const resourceConflicts = (args.action.resourcesUsed || []).filter((r) => (agent.dependsOnResources || []).includes(r));
        delta += resourceConflicts.length * 50; // +50ms per conflict
        // Shared state modification
        const stateConflicts = (args.action.sharedStateModified || []).filter((s) => (agent.dependsOnState || []).includes(s));
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
function checkMultiAgentEquilibrium(args) {
    const conflicts = [];
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
