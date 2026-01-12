import {
  Action,
  CandidatePath,
  OPTRRun,
  WhyNotTrace,
  OPTRScore,
} from "../canon/types";

type Weights = { lambdaC: number; lambdaR: number; lambdaP: number };

export function scorePath(
  path: CandidatePath,
  features: { ttv: number; cost: number; risk: number; successProb: number },
  w: Weights
): OPTRScore {
  const { ttv, cost, risk, successProb } = features;
  const total = ttv + w.lambdaC * cost + w.lambdaR * risk - w.lambdaP * Math.log(Math.max(successProb, 1e-9));
  return {
    ttv, cost, risk, successProb, total,
    components: { ttv, cost: w.lambdaC * cost, risk: w.lambdaR * risk, prob: -w.lambdaP * Math.log(Math.max(successProb, 1e-9)) }
  };
}

export function gateSecondActionTooEarly(
  nextAction: Action,
  canonIdsPresent: Set<string>,
  nowIso: string,
  tenantId: string
): WhyNotTrace | null {
  const missing = nextAction.prerequisitesCanonIds.filter(id => !canonIdsPresent.has(id));
  if (missing.length === 0) return null;

  return {
    ts: nowIso,
    actionId: nextAction.id,
    denied: true,
    reasonCodes: ["MISSING_CANON_PREREQS"],
    missingCanonIds: missing,
    requiredCanonRefs: missing,
    message:
      `Denied: "${nextAction.name}" is too early. Missing prerequisite canon items: ${missing.join(", ")}.`
  };
}

export function optrResolve(params: {
  ts: string;
  tenantId: string;
  goal: string;
  candidates: CandidatePath[];
  canonRefsUsed: string[];
  canonIdsPresent: string[];
  weights: Weights;
  featureFn: (p: CandidatePath) => { ttv: number; cost: number; risk: number; successProb: number; nextAction: Action };
}): OPTRRun {
  const canonSet = new Set(params.canonIdsPresent);
  const denyTraces: WhyNotTrace[] = [];

  // Score all candidates
  for (const c of params.candidates) {
    const f = params.featureFn(c);
    c.score = scorePath(c, f, params.weights);

    // Gate: “second action too early”
    const deny = gateSecondActionTooEarly(f.nextAction, canonSet, params.ts, params.tenantId);
    if (deny) {
      denyTraces.push(deny);
      // Make path inadmissible by setting score to infinity
      c.score.total = Number.POSITIVE_INFINITY;
    }
  }

  // Select best admissible
  const sorted = [...params.candidates].sort((a, b) => (a.score?.total ?? Infinity) - (b.score?.total ?? Infinity));
  const selected = sorted[0];
  const nextAction = params.featureFn(selected).nextAction;

  return {
    ts: params.ts,
    tenantId: params.tenantId,
    goal: params.goal,
    candidates: params.candidates,
    selectedPathId: selected?.id,
    selectedNextActionId: selected ? nextAction.id : undefined,
    denyTraces: denyTraces.length ? denyTraces : undefined,
    canonRefsUsed: params.canonRefsUsed
  };
}
