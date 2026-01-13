/**
 * OPTR Policy Selection with Structured Denial Binding (Phase 3: Trust UX)
 * TIMESTAMP: 2026-01-12T21:35:00Z
 *
 * Wires OPTR decision engine to mechanical denial system.
 * Guarantees:
 * - All OPTR denials are ledgered
 * - Structured denial traces with stable taxonomy
 * - Replayable WhyNot explanations
 */

import {
  OPTRRun,
  OPTRWeights,
  CandidatePath,
  CandidateFeatures,
  Action,
} from "@bickford/types";
import { optrResolve } from "../../../bickford/src/canon/optr";
import { mechanicalDenyBatch } from "../runtime/deny";

/**
 * Select optimal policy using OPTR with automatic denial ledgering
 *
 * This wraps the core OPTR resolution with mechanical denial persistence.
 */
export async function selectPolicyWithDenialTracking(params: {
  ts: string;
  tenantId: string;
  goal: string;
  candidates: CandidatePath[];
  canonRefsUsed: string[];
  canonIdsPresent: string[];
  canonStore: Map<string, { level: any }>;
  weights: OPTRWeights;
  bounds?: { maxRisk?: number; maxCost?: number };
  featureFn: (p: CandidatePath) => CandidateFeatures;
}): Promise<{
  optrRun: OPTRRun;
  denialIds: string[];
}> {
  // Execute OPTR resolution
  const optrRun = optrResolve(params);

  // Build action map for denial persistence
  const actionMap = new Map<string, Action>();
  for (const candidate of params.candidates) {
    if (candidate.features?.nextAction) {
      actionMap.set(
        candidate.features.nextAction.id,
        candidate.features.nextAction
      );
    }
  }

  // Persist all denials
  let denialIds: string[] = [];
  if (optrRun.denyTraces && optrRun.denyTraces.length > 0) {
    const result = await mechanicalDenyBatch({
      traces: optrRun.denyTraces,
      tenantId: params.tenantId,
      goal: params.goal,
      actions: actionMap,
      optrRunId: `optr-${params.ts}`,
    });
    denialIds = result.denialIds;
  }

  return {
    optrRun,
    denialIds,
  };
}

/**
 * Simplified policy selection (synchronous OPTR without persistence)
 *
 * Use this for testing or when persistence is handled separately.
 * For production, prefer selectPolicyWithDenialTracking.
 */
export function selectPolicy(params: {
  ts: string;
  tenantId: string;
  goal: string;
  candidates: CandidatePath[];
  canonRefsUsed: string[];
  canonIdsPresent: string[];
  canonStore: Map<string, { level: any }>;
  weights: OPTRWeights;
  bounds?: { maxRisk?: number; maxCost?: number };
  featureFn: (p: CandidatePath) => CandidateFeatures;
}): OPTRRun {
  return optrResolve(params);
}
