// promote.contract.ts
// TIMESTAMP: 2025-12-23T13:41:00-05:00
import { z } from "zod";
import crypto from "crypto";
import { stableStringify, sha256 } from "./decide.contract";

export const PromotionGateSchema = z.object({
  resistance: z.object({
    passed: z.boolean(),
    notes: z.string().optional(),
    evidenceIds: z.array(z.string()).optional(),
  }),
  reproducibility: z.object({
    passed: z.boolean(),
    notes: z.string().optional(),
    trialCount: z.number().int().nonnegative().optional(),
    evidenceIds: z.array(z.string()).optional(),
  }),
  invariantSafety: z.object({
    passed: z.boolean(),
    notes: z.string().optional(),
    checkedInvariants: z.array(z.string()).optional(),
  }),
  feasibilityImpact: z.object({
    passed: z.boolean(),
    notes: z.string().optional(),
    deltaPiSummary: z.string().optional(),
  }),
});

export const CanonPromotionRequestSchema = z.object({
  candidate: z.object({
    kind: z.enum(["invariant", "constraint", "definition", "policy", "model"]),
    id: z.string().min(1),
    title: z.string().min(1),
    content: z.string().min(1),
    tags: z.array(z.string()).optional(),
  }),
  provenance: z.object({
    source: z.string().min(1),
    author: z.string().min(1),
    createdAt: z.string().min(1),
    evidenceArtifactHashes: z.array(z.string()).optional(),
  }),
  gate: PromotionGateSchema,
  context: z
    .object({
      actor: z
        .object({
          type: z.enum(["human", "agent", "system"]),
          id: z.string().optional(),
        })
        .optional(),
      tenantId: z.string().optional(),
      sessionId: z.string().optional(),
      environment: z.enum(["dev", "staging", "prod"]).optional(),
      inputs: z.record(z.unknown()).optional(),
    })
    .optional(),
  idempotencyKey: z.string().optional(),
});

export type CanonPromotionRequest = z.infer<typeof CanonPromotionRequestSchema>;

export type CanonPromotionAllowResponse = {
  decision: "ALLOW";
  promotionId: string;
  ts: string;
  canonId: string;
  proof: {
    canonVersion: string;
    ledgerPointer?: string;
    gateSummary: {
      resistance: true;
      reproducibility: true;
      invariantSafety: true;
      feasibilityImpact: true;
    };
  };
};

export type CanonPromotionDenyResponse = {
  decision: "DENY";
  promotionId: string;
  ts: string;
  canonId: string;
  denialTrace: {
    code: string;
    reason: string;
    failedChecks: Array<"resistance" | "reproducibility" | "invariantSafety" | "feasibilityImpact">;
    minimalFix: string[];
    whyNotId?: string;
  };
};

export type CanonPromotionResponse = CanonPromotionAllowResponse | CanonPromotionDenyResponse;

export function buildStablePromotionKey(params: {
  tenantId: string;
  canonId: string;
  idempotencyKey: string;
  candidate: CanonPromotionRequest["candidate"];
  provenance: CanonPromotionRequest["provenance"];
  gate: CanonPromotionRequest["gate"];
  context?: CanonPromotionRequest["context"];
}): string {
  const stablePayload = {
    tenantId: params.tenantId,
    canonId: params.canonId,
    idempotencyKey: params.idempotencyKey,
    candidate: params.candidate,
    provenance: params.provenance,
    gate: params.gate,
    context: {
      sessionId: params.context?.sessionId,
      environment: params.context?.environment,
      actor: params.context?.actor,
    },
  };
  return sha256(stableStringify(stablePayload));
}
