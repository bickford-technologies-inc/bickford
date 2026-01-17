import { DenialReasonCode } from "./types";
import type {
  Action,
  CandidatePath,
  CandidateFeatures,
  OPTRScore,
  OPTRWeights,
  WhyNotTrace,
} from "./types";

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
  const missing = (nextAction.prerequisitesCanonIds ?? []).filter(
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
  return {
    ts: nowIso,
    actionId: action.id,
    denied: true,
    reasonCodes: [DenialReasonCode.AUTHORITY_BOUNDARY_FAIL],
    missingCanonIds: [],
    requiredCanonRefs: canonRefsUsed,
    message: "Authority boundary violation",
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
  if (!features.nextAction) return null;
  return {
    ts: nowIso,
    actionId: features.nextAction.id,
    denied: true,
    reasonCodes: [DenialReasonCode.RISK_BOUND_EXCEEDED],
    message: `Denied: Risk ${features.risk.toFixed(2)} exceeds bound ${maxRisk.toFixed(2)}`,
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
  if (!features.nextAction) return null;
  return {
    ts: nowIso,
    actionId: features.nextAction.id,
    denied: true,
    reasonCodes: [DenialReasonCode.COST_BOUND_EXCEEDED],
    message: `Denied: Cost ${features.cost.toFixed(2)} exceeds bound ${maxCost.toFixed(2)}`,
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
