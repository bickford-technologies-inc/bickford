/**
 * OPTR (Opportunity Targeting & Response) Engine
 * TIMESTAMP: 2025-12-21T14:41:00-05:00
 * LOCKED: Canonical OPTR loop implementation
 *
 * Minimizes E[Time-to-Value] subject to constraints:
 * π* = argmin_{π ∈ Π_adm} E[TTV(π) + λC·C(π) + λR·R(π) − λP·log p(π)]
 */

import type {
  Action,
  CandidatePath,
  CandidateFeatures,
  OPTRRun,
  OPTRScore,
  OPTRWeights,
  AuthorityCheckResult,
  PathConstraint,
  ConfidenceEnvelope,
} from "@bickford/types";
import { DenialReasonCode } from "@bickford/types";
import type { WhyNotTrace } from "@bickford/authority";
import type { AuthorityContext } from "@bickford/authority";

/**
 * Score a candidate path using OPTR objective function
 */
export function scorePath(
  path: CandidatePath,
  features: CandidateFeatures,
  weights: OPTRWeights,
): OPTRScore {
  const { ttv, cost, risk, successProb } = features;
  const total =
    ttv +
    weights.lambdaC * cost +
    weights.lambdaR * risk -
    weights.lambdaP * Math.log(Math.max(successProb, 1e-9));

  return {
    ttv,
    cost,
    risk,
    successProb,
    total,
    components: {
      ttv,
      cost: weights.lambdaC * cost,
      risk: weights.lambdaR * risk,
      prob: -weights.lambdaP * Math.log(Math.max(successProb, 1e-9)),
    },
  };
}

/**
 * Gate: "Second action too early"
 * Prevents actions when prerequisite canon is missing
 */
export function gateSecondActionTooEarly(
  nextAction: Action,
  canonIdsPresent: Set<string>,
  nowIso: string,
): WhyNotTrace | null {
  const missing = nextAction.prerequisitesCanonIds.filter(
    (id) => !canonIdsPresent.has(id),
  );

  if (missing.length === 0) return null;

  return {
    ts: nowIso,
    actionId: nextAction.id,
    denied: true,
    reasonCodes: [DenialReasonCode.MISSING_CANON_PREREQS],
    missingCanonIds: missing,
    requiredCanonRefs: missing,
    message: `Denied: "${
      nextAction.name
    }" is too early. Missing prerequisite canon items: ${missing.join(", ")}.`,
  };
}

/**
 * Gate: Authority boundary check
 * UPGRADE #1: Mechanical enforcement of canon citation requirement
 */
export function gateAuthorityBoundary(
  action: Action,
  canonRefsUsed: string[],
  canonStore: Map<string, { level: any }>,
  nowIso: string,
): WhyNotTrace | null {
  const authCheck = requireCanonRefs(action.id, canonRefsUsed, canonStore);

  if (authCheck.ok) return null;

  return {
    ts: nowIso,
    actionId: action.id,
    denied: true,
    reasonCodes: [DenialReasonCode.AUTHORITY_BOUNDARY_FAIL],
    missingCanonIds: authCheck.missingRefs,
    requiredCanonRefs: canonRefsUsed,
    message: authCheck.message || "Authority boundary violation",
    context: {
      invalidRefs: authCheck.invalidRefs,
    },
  };
}

/**
 * Gate: Risk bounds
 */
export function gateRiskBounds(
  features: CandidateFeatures,
  maxRisk: number,
  nowIso: string,
): WhyNotTrace | null {
  if (features.risk <= maxRisk) return null;

  return {
    ts: nowIso,
    actionId: features.nextAction.id,
    denied: true,
    reasonCodes: [DenialReasonCode.RISK_BOUND_EXCEEDED],
    message: `Denied: Risk ${features.risk.toFixed(
      2,
    )} exceeds bound ${maxRisk.toFixed(2)}`,
    context: { risk: features.risk, maxRisk },
  };
}

/**
 * Gate: Cost bounds
 */
export function gateCostBounds(
  features: CandidateFeatures,
  maxCost: number,
  nowIso: string,
): WhyNotTrace | null {
  if (features.cost <= maxCost) return null;

  return {
    ts: nowIso,
    actionId: features.nextAction.id,
    denied: true,
    reasonCodes: [DenialReasonCode.COST_BOUND_EXCEEDED],
    message: `Denied: Cost ${features.cost.toFixed(
      2,
    )} exceeds bound ${maxCost.toFixed(2)}`,
    context: { cost: features.cost, maxCost },
  };
}

/**
 * OPTR Resolve: Select optimal path from candidates
 *
 * UPGRADE #3: Fixed selection bug by caching features during scoring
 */
export function optrResolve(params: {
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
  const canonSet = new Set(params.canonIdsPresent);
  const denyTraces: WhyNotTrace[] = [];

  // UPGRADE #3: Cache features during scoring to avoid stochastic/stateful bugs
  for (const candidate of params.candidates) {
    // Compute and cache features ONCE
    const features = params.featureFn(candidate);
    candidate.features = features;

    // Score using cached features
    candidate.score = scorePath(candidate, features, params.weights);

    // Run all gates using cached features
    const gates: (WhyNotTrace | null)[] = [
      gateSecondActionTooEarly(features.nextAction, canonSet, params.ts),
      gateAuthorityBoundary(
        features.nextAction,
        params.canonRefsUsed,
        params.canonStore,
        params.ts,
      ),
    ];

    if (params.bounds?.maxRisk !== undefined) {
      gates.push(gateRiskBounds(features, params.bounds.maxRisk, params.ts));
    }

    if (params.bounds?.maxCost !== undefined) {
      gates.push(gateCostBounds(features, params.bounds.maxCost, params.ts));
    }

    // Collect denials
    for (const deny of gates) {
      if (deny) {
        denyTraces.push(deny);
        // Make path inadmissible
        candidate.score.total = Number.POSITIVE_INFINITY;
      }
    }
  }

  // Select best admissible (using cached score)
  const sorted = [...params.candidates].sort(
    (a, b) => (a.score?.total ?? Infinity) - (b.score?.total ?? Infinity),
  );

  const selected = sorted[0];
  const nextAction = selected?.features?.nextAction;

  return {
    ts: params.ts,
    tenantId: params.tenantId,
    goal: params.goal,
    candidates: params.candidates,
    selectedPathId: selected?.id,
    selectedNextActionId: nextAction?.id,
    denyTraces: denyTraces.length ? denyTraces : undefined,
    canonRefsUsed: params.canonRefsUsed,
  };
}

/**
 * Default OPTR weights (can be tuned per use case)
 */
export const DEFAULT_WEIGHTS: OPTRWeights = {
  lambdaC: 0.1, // Cost coefficient
  lambdaR: 0.2, // Risk coefficient
  lambdaP: 0.05, // Success probability coefficient
};

/**
 * UPGRADE #8: Ingest canon knowledge as path constraints
 *
 * Converts canon knowledge items into OPTR path constraints.
 * This enables canon-level knowledge to directly influence admissibility.
 */
export function ingestCanonAsConstraints(
  canonStore: Map<
    string,
    {
      level: string;
      kind: string;
      statement: string;
      confidence?: ConfidenceEnvelope;
    }
  >,
  targetActions: Action[],
): PathConstraint[] {
  const constraints: PathConstraint[] = [];

  for (const [canonId, item] of canonStore.entries()) {
    // TODO: Implement constraint ingestion logic here
    // Example placeholder:
    // constraints.push({ ... });
  }
  return constraints;
}

/**
 * Stub: Compute OPTR value
 */
export function computeOPTR(params: {
  intent: string;
  context: AuthorityContext;
}): number {
  // OPTR computation
  return 1.0;
}
