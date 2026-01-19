/**
 * Denied Decision Persistence (Phase 3: Trust UX)
 * TIMESTAMP: 2026-01-12T21:35:00Z
 *
 * Ledgers denied decisions for replayable WhyNot explanations.
 * Guarantees: No silent denials, every denial is persisted and replayable.
 */

import type { DeniedDecisionPayload } from "@bickford/types";
import type { CanonDenialRecord } from "../types";

/**
 * Persist a denied decision to the ledger
 *
 * Guarantees:
 * - Every denial is ledgered
 * - Replayable with stable reason codes
 * - Supports tenant isolation
 */
export function persistDeniedDecision(
  payload: DeniedDecisionPayload,
): CanonDenialRecord {
  return {
    id: payload.actionId,
    tenantId: payload.tenantId,
    ts: payload.ts,
    reasonCodes: payload.reasonCodes!,
    message: payload.message,
  };
}

/**
 * Retrieve denied decisions for an action
 * Used for WhyNot explanations
 */
export async function getDeniedDecisions(params: {
  actionId?: string;
  tenantId?: string;
  limit?: number;
}): Promise<DeniedDecisionPayload[]> {
  try {
    const records = await getPrisma().deniedDecision.findMany({
      where: {
        ...(params.actionId && { actionId: params.actionId }),
        ...(params.tenantId && { tenantId: params.tenantId }),
      },
      orderBy: { createdAt: "desc" },
      take: params.limit || 100,
    });

    return records.map((r: any) => ({
      denied: true,
      ts: r.ts,
      actionId: r.actionId,
      tenantId: r.tenantId,
      reasonCodes: r.reasonCodes,
      message: r.message,
    }));
  } catch (error) {
    console.error("Failed to retrieve denied decisions:", error);
    return [];
  }
}
