// noninterference.contract.ts
// TIMESTAMP: 2025-12-23T14:02:00-05:00
import { z } from "zod";
import { stableStringify, sha256 } from "./decide.contract";

export const CanonRefSchema = z.object({
  kind: z.enum(["invariant", "constraint", "definition", "policy", "model"]),
  id: z.string().min(1),
  version: z.string().optional(),
  hash: z.string().optional(),
});

export const NonInterferenceRequestSchema = z.object({
  proposer: z.object({
    agentId: z.string().min(1),
    goal: z.string().min(1),
  }),
  action: z.object({
    actionId: z.string().min(1),
    description: z.string().min(1),
    tags: z.array(z.string()).optional(),
  }),
  others: z.array(
    z.object({
      agentId: z.string().min(1),
      goal: z.string().min(1),
      baselineExpectedTTV: z.number().nonnegative().optional(),
      predictedExpectedTTV: z.number().nonnegative().optional(),
    })
  ),
  canonRefs: z.array(CanonRefSchema),
  context: z
    .object({
      tenantId: z.string().optional(),
      sessionId: z.string().optional(),
      environment: z.enum(["dev", "staging", "prod"]).optional(),
      actor: z
        .object({
          type: z.enum(["human", "agent", "system"]),
          id: z.string().optional(),
        })
        .optional(),
      evidence: z.array(z.string()).optional(),
    })
    .optional(),
  idempotencyKey: z.string().optional(),
});

export type NonInterferenceRequest = z.infer<typeof NonInterferenceRequestSchema>;

export type NonInterferenceAllowResponse = {
  decision: "ALLOW";
  checkId: string;
  ts: string;
  actionId: string;
  proof: {
    canonVersion: string;
    evaluatedInvariants: string[];
    deltas: Array<{ agentId: string; deltaExpectedTTV: number }>;
    ledgerPointer?: string;
  };
};

export type NonInterferenceDenyResponse = {
  decision: "DENY";
  checkId: string;
  ts: string;
  actionId: string;
  denialTrace: {
    code: "CANON_COVERAGE_GATE" | "MISSING_TTV_INPUTS" | "NON_INTERFERENCE_VIOLATION";
    reason: string;
    failedInvariant?: string;
    missingCanon?: string[];
    offenders?: Array<{ agentId: string; deltaExpectedTTV: number }>;
    minimalFix: string[];
    whyNotId?: string;
  };
};

export type NonInterferenceResponse = NonInterferenceAllowResponse | NonInterferenceDenyResponse;

export function buildStableNonInterferenceKey(params: {
  tenantId: string;
  idempotencyKey: string;
  proposer: NonInterferenceRequest["proposer"];
  action: NonInterferenceRequest["action"];
  others: NonInterferenceRequest["others"];
  canonRefs: NonInterferenceRequest["canonRefs"];
  context?: NonInterferenceRequest["context"];
}): string {
  const canonIds = params.canonRefs.map((r) => r.id).sort();
  const stablePayload = {
    tenantId: params.tenantId,
    idempotencyKey: params.idempotencyKey,
    proposer: params.proposer,
    action: params.action,
    others: params.others,
    canonIds,
    context: {
      sessionId: params.context?.sessionId,
      environment: params.context?.environment,
      actor: params.context?.actor,
      evidence: params.context?.evidence,
    },
  };
  return sha256(stableStringify(stablePayload));
}
