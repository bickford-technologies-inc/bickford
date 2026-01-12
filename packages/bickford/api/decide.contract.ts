// decide.contract.ts
// TIMESTAMP: 2025-12-23T13:33:00-05:00
import { z } from "zod";
import crypto from "crypto";

export type CanonRefKind = "invariant" | "constraint" | "definition" | "policy" | "model";

export const CanonRefSchema = z.object({
  kind: z.enum(["invariant", "constraint", "definition", "policy", "model"]),
  id: z.string().min(1),
  version: z.string().optional(),
  hash: z.string().optional(),
});

export const CanonDecideRequestSchema = z.object({
  actionId: z.string().min(1),
  intent: z.object({
    objective: z.string().min(1),
    proposedAction: z.string().min(1),
    target: z
      .object({
        type: z.string().min(1),
        id: z.string().optional(),
      })
      .optional(),
  }),
  canonRefs: z.array(CanonRefSchema),
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

export type CanonDecideRequest = z.infer<typeof CanonDecideRequestSchema>;

export type CanonDecideAllowResponse = {
  decision: "ALLOW";
  decisionId: string;
  ts: string; // ISO
  actionId: string;
  proof: {
    canonVersion: string;
    evaluatedRefs: string[];
    ledgerPointer?: string;
  };
};

export type CanonDecideDenyResponse = {
  decision: "DENY";
  decisionId: string;
  ts: string; // ISO
  actionId: string;
  denialTrace: {
    code: string; // e.g. CANON_COVERAGE_GATE
    reason: string;
    failedInvariant?: string;
    missingCanon?: string[];
    minimalFix: string[];
    whyNotId?: string;
  };
};

export type CanonDecideResponse = CanonDecideAllowResponse | CanonDecideDenyResponse;

/**
 * Normalize an object for stable hashing:
 * - stable key order
 * - remove undefined
 * - preserve arrays order
 */
export function stableStringify(value: unknown): string {
  const seen = new WeakSet();
  const normalize = (v: any): any => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    if (typeof v !== "object") return v;
    if (seen.has(v)) return "[Circular]";
    seen.add(v);

    if (Array.isArray(v)) return v.map(normalize);

    const keys = Object.keys(v).sort();
    const out: Record<string, any> = {};
    for (const k of keys) {
      const nv = normalize(v[k]);
      if (nv !== undefined) out[k] = nv;
    }
    return out;
  };

  return JSON.stringify(normalize(value));
}

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Build a stable idempotency key for the server to cache on.
 * IMPORTANT: includes normalized intent + canonRefs ids + tenant + actionId + idempotencyKey
 */
export function buildStableDecisionKey(params: {
  tenantId: string;
  actionId: string;
  idempotencyKey: string;
  intent: CanonDecideRequest["intent"];
  canonRefs: CanonDecideRequest["canonRefs"];
  context?: CanonDecideRequest["context"];
}): string {
  const canonIds = params.canonRefs.map((r) => r.id).sort();
  const stablePayload = {
    tenantId: params.tenantId,
    actionId: params.actionId,
    idempotencyKey: params.idempotencyKey,
    intent: params.intent,
    canonIds,
    // include only the context fields that should affect determinism
    context: {
      sessionId: params.context?.sessionId,
      environment: params.context?.environment,
      actor: params.context?.actor,
    },
  };

  return sha256(stableStringify(stablePayload));
}
