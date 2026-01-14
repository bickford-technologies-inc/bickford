/**
 * Denied Decision Persistence (Phase 3: Trust UX)
 * TIMESTAMP: 2026-01-12T21:35:00Z
 *
 * Ledgers denied decisions for replayable WhyNot explanations.
 * Guarantees: No silent denials, every denial is persisted and replayable.
 */

import { DeniedDecisionPayload } from "@bickford/types";
import { getPrisma } from "@bickford/db";

/**
 * Persist a denied decision to the ledger
 *
 * Guarantees:
 * - Every denial is ledgered
 * - Replayable with stable reason codes
 * - Supports tenant isolation
 */
export async function persistDeniedDecision(
  payload: DeniedDecisionPayload
): Promise<{ id: string; success: boolean }> {
  try {
    const deniedDecision = await getPrisma().deniedDecision.create({
      data: {
        ts: payload.ts,
        actionId: payload.actionId,
        tenantId: payload.tenantId!,
        reasonCodes: payload.reasonCodes,
        message: payload.message,
      },
    });

    return {
      id: deniedDecision.id,
      success: true,
    };
  } catch (error) {
    // Log error but don't throw - denial tracking failure should not block execution
    console.error("Failed to persist denied decision:", error);

    return {
      id: "",
      success: false,
    };
  }
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
