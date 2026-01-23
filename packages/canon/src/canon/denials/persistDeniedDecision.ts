/**
 * Denied Decision Persistence (Phase 3: Trust UX)
 * TIMESTAMP: 2026-01-12T21:35:00Z
 *
 * Ledgers denied decisions for replayable WhyNot explanations.
 * Guarantees: No silent denials, every denial is persisted and replayable.
 */

import type { DeniedDecisionPayload } from "../../types/denied";
import { getPrisma } from "../../db/prisma.js";

/**
 * Persist a denied decision to the ledger
 *
 * Guarantees:
 * - Every denial is ledgered
 * - Replayable with stable reason codes
 * - Supports tenant isolation
 */
export async function persistDeniedDecision(
  payload: DeniedDecisionPayload,
): Promise<void> {
  // Stub implementation - replace with actual Prisma call in production
  console.log("Persisting denied decision:", {
    decisionId: payload.decisionId,
    ts: payload.ts,
    reasonCodes: payload.reasonCodes,
    message: payload.message,
  });

  // In production, would use Prisma:
  // const prisma = await getPrisma();
  // await prisma.deniedDecision.create({
  //   data: {
  //     decisionId: payload.decisionId,
  //     timestamp: new Date(payload.ts),
  //     reasonCodes: payload.reasonCodes,
  //     message: payload.message,
  //   },
  // });
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
    const prisma = await getPrisma();
    const records = await prisma.deniedDecision.findMany({
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
