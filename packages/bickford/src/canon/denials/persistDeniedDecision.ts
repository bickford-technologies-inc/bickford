/**
 * Denied Decision Persistence (Phase 3: Trust UX)
 * TIMESTAMP: 2026-01-12T21:35:00Z
 * 
 * Ledgers denied decisions for replayable WhyNot explanations.
 * Guarantees: No silent denials, every denial is persisted and replayable.
 */

import { DeniedDecisionPayload } from "../types";

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
  // Import Prisma client dynamically to avoid circular dependencies
  // This is safe because Prisma is always available in runtime
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const deniedDecision = await prisma.deniedDecision.create({
      data: {
        ts: payload.ts,
        actionId: payload.actionId,
        actionName: payload.actionName || null,
        tenantId: payload.tenantId,
        goal: payload.goal || null,
        reasonCodes: payload.reasonCodes,
        missingCanonIds: payload.missingCanonIds || [],
        violatedInvariantIds: payload.violatedInvariantIds || [],
        requiredCanonRefs: payload.requiredCanonRefs || [],
        message: payload.message,
        context: payload.context || null,
        optrRunId: payload.optrRunId || null,
      },
    });

    await prisma.$disconnect();

    return {
      id: deniedDecision.id,
      success: true,
    };
  } catch (error) {
    await prisma.$disconnect();
    
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
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();

  try {
    const records = await prisma.deniedDecision.findMany({
      where: {
        ...(params.actionId && { actionId: params.actionId }),
        ...(params.tenantId && { tenantId: params.tenantId }),
      },
      orderBy: { createdAt: "desc" },
      take: params.limit || 100,
    });

    await prisma.$disconnect();

    return records.map((r) => ({
      ts: r.ts,
      actionId: r.actionId,
      actionName: r.actionName || undefined,
      tenantId: r.tenantId,
      goal: r.goal || undefined,
      reasonCodes: r.reasonCodes as any[],
      missingCanonIds: r.missingCanonIds,
      violatedInvariantIds: r.violatedInvariantIds,
      requiredCanonRefs: r.requiredCanonRefs,
      message: r.message,
      context: r.context as Record<string, any> | undefined,
      optrRunId: r.optrRunId || undefined,
    }));
  } catch (error) {
    await prisma.$disconnect();
    console.error("Failed to retrieve denied decisions:", error);
    return [];
  }
}
}
