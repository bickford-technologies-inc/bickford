/**
 * OPTR (Opportunity Targeting & Response) Engine
 * TIMESTAMP: 2025-12-21T14:41:00-05:00
 * LOCKED: Canonical OPTR loop implementation
 *
 * Minimizes E[Time-to-Value] subject to constraints:
 * π* = argmin_{π ∈ Π_adm} E[TTV(π) + λC·C(π) + λR·R(π) − λP·log p(π)]
 */
import { Action, CandidatePath, CandidateFeatures, OPTRRun, OPTRScore, OPTRWeights, WhyNotTrace, PathConstraint, ConfidenceEnvelope } from "./types";
/**
 * Score a candidate path using OPTR objective function
 */
export declare function scorePath(path: CandidatePath, features: CandidateFeatures, weights: OPTRWeights): OPTRScore;
/**
 * Gate: "Second action too early"
 * Prevents actions when prerequisite canon is missing
 */
export declare function gateSecondActionTooEarly(nextAction: Action, canonIdsPresent: Set<string>, nowIso: string): WhyNotTrace | null;
/**
 * Gate: Authority boundary check
 * UPGRADE #1: Mechanical enforcement of canon citation requirement
 */
export declare function gateAuthorityBoundary(action: Action, canonRefsUsed: string[], canonStore: Map<string, {
    level: any;
}>, nowIso: string): WhyNotTrace | null;
/**
 * Gate: Risk bounds
 */
export declare function gateRiskBounds(features: CandidateFeatures, maxRisk: number, nowIso: string): WhyNotTrace | null;
/**
 * Gate: Cost bounds
 */
export declare function gateCostBounds(features: CandidateFeatures, maxCost: number, nowIso: string): WhyNotTrace | null;
/**
 * OPTR Resolve: Select optimal path from candidates
 *
 * UPGRADE #3: Fixed selection bug by caching features during scoring
 */
export declare function optrResolve(params: {
    ts: string;
    tenantId: string;
    goal: string;
    candidates: CandidatePath[];
    canonRefsUsed: string[];
    canonIdsPresent: string[];
    canonStore: Map<string, {
        level: any;
    }>;
    weights: OPTRWeights;
    bounds?: {
        maxRisk?: number;
        maxCost?: number;
    };
    featureFn: (p: CandidatePath) => CandidateFeatures;
}): OPTRRun;
/**
 * Default OPTR weights (can be tuned per use case)
 */
export declare const DEFAULT_WEIGHTS: OPTRWeights;
/**
 * UPGRADE #8: Ingest canon knowledge as path constraints
 *
 * Converts canon knowledge items into OPTR path constraints.
 * This enables canon-level knowledge to directly influence admissibility.
 */
export declare function ingestCanonAsConstraints(canonStore: Map<string, {
    level: string;
    kind: string;
    statement: string;
    confidence?: ConfidenceEnvelope;
}>, targetActions: Action[]): PathConstraint[];
/**
 * Apply path constraints to OPTR candidate evaluation
 *
 * Constraints derived from canon knowledge further restrict admissibility
 * beyond the standard OPTR gates.
 */
export declare function applyPathConstraints(candidate: CandidatePath, constraints: PathConstraint[], nowIso: string): WhyNotTrace[];
