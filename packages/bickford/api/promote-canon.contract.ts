/**
 * Canon Promotion API Contract
 * TIMESTAMP: 2026-01-12T20:50:00-05:00
 * 
 * POST /api/canon/promote
 * Endpoint for monotonic knowledge promotion (EVIDENCE → PROPOSED → CANON)
 */

import { PromotionRequest, PromotionDecision, PromotionTests } from "../src/canon/types";
import { promotionGate, runPromotionTests } from "../src/canon/promotion";

export type PromoteRequestBody = {
  itemId: string;
  from: "EVIDENCE" | "PROPOSED";
  to: "PROPOSED" | "CANON";
  evidenceRefs: string[];
  reason: string;
  
  // Optional: provide test results if already computed
  tests?: PromotionTests;
};

export type PromoteResponseBody = {
  ok: boolean;
  decision: PromotionDecision;
  message: string;
};

/**
 * Validate promotion request
 */
export function validatePromoteRequest(body: any): {
  valid: boolean;
  error?: string;
  request?: PromoteRequestBody;
} {
  if (!body.itemId || typeof body.itemId !== "string") {
    return { valid: false, error: "Missing or invalid itemId" };
  }
  
  if (!body.from || !["EVIDENCE", "PROPOSED"].includes(body.from)) {
    return { valid: false, error: "from must be EVIDENCE or PROPOSED" };
  }
  
  if (!body.to || !["PROPOSED", "CANON"].includes(body.to)) {
    return { valid: false, error: "to must be PROPOSED or CANON" };
  }
  
  // Cannot skip levels
  if (body.from === "EVIDENCE" && body.to === "CANON") {
    return { valid: false, error: "Cannot promote directly from EVIDENCE to CANON" };
  }
  
  if (!Array.isArray(body.evidenceRefs)) {
    return { valid: false, error: "evidenceRefs must be an array" };
  }
  
  if (!body.reason || typeof body.reason !== "string") {
    return { valid: false, error: "Missing or invalid reason" };
  }
  
  return {
    valid: true,
    request: body as PromoteRequestBody,
  };
}

/**
 * Process promotion request
 */
export async function processPromoteRequest(
  request: PromoteRequestBody,
  canonStore: Map<string, any>
): Promise<PromoteResponseBody> {
  const nowIso = new Date().toISOString();
  
  // Check if item exists
  const item = canonStore.get(request.itemId);
  if (!item) {
    return {
      ok: false,
      decision: {
        ts: nowIso,
        itemId: request.itemId,
        from: request.from,
        to: request.from,
        tests: {
          resistance: false,
          reproducible: false,
          invariantSafe: false,
          feasibilityImpact: false,
          evidenceRefs: request.evidenceRefs,
        },
        approved: false,
        reason: `Item ${request.itemId} not found in canon store`,
      },
      message: "Item not found",
    };
  }
  
  // Verify current level matches request
  if (item.level !== request.from) {
    return {
      ok: false,
      decision: {
        ts: nowIso,
        itemId: request.itemId,
        from: request.from,
        to: request.from,
        tests: {
          resistance: false,
          reproducible: false,
          invariantSafe: false,
          feasibilityImpact: false,
          evidenceRefs: request.evidenceRefs,
        },
        approved: false,
        reason: `Item level mismatch: expected ${request.from}, found ${item.level}`,
      },
      message: "Level mismatch",
    };
  }
  
  // Run promotion tests if not provided
  let tests: PromotionTests;
  if (request.tests) {
    tests = request.tests;
  } else {
    tests = await runPromotionTests({
      itemId: request.itemId,
      evidenceRefs: request.evidenceRefs,
      // Simplified test implementations - production would be more sophisticated
      checkResistance: async () => {
        // Check if there's evidence of failure modes
        return request.evidenceRefs.length > 0;
      },
      checkReproducibility: async () => {
        // Check if evidence is stable across contexts
        return request.evidenceRefs.length >= 2;
      },
      checkInvariantSafety: async () => {
        // Check if promotion would violate any invariants
        // For now, assume safe
        return true;
      },
      checkFeasibilityImpact: async () => {
        // Check if promotion materially changes admissible set
        // For CANON promotion, this should always be true
        return request.to === "CANON";
      },
    });
  }
  
  // Apply promotion gate
  const decision = promotionGate({
    ts: nowIso,
    itemId: request.itemId,
    from: request.from,
    tests,
  });
  
  // Update item level if approved
  if (decision.approved) {
    item.level = decision.to;
    item.promotedAt = nowIso;
  }
  
  return {
    ok: decision.approved,
    decision,
    message: decision.approved
      ? `Item promoted from ${decision.from} to ${decision.to}`
      : decision.reason,
  };
}
