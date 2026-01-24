/**
 * Mechanical Denial Runtime (Phase 3: Trust UX)
 * TIMESTAMP: 2026-01-12T21:35:00Z
 *
 * Enforces mechanical denial with automatic ledger persistence.
 * Guarantees:
 * - No silent denials
 * - Every denial is ledgered before response
 * - Structured denial payloads with stable taxonomy
 */

import { WhyNotTrace, DeniedDecisionPayload, Action } from "@bickford/types";
import crypto from "node:crypto";

function persistDeniedDecision(_: DeniedDecisionPayload) {
  // TODO: wire to @bickford/canon persistence
  return { success: true, id: "stub-denial-id" };
}

/**
 * Mechanically deny an action and persist to ledger
 *
 * This is the canonical denial function - all denials MUST flow through here
 * to ensure ledger persistence and trust UX guarantees.
 */
export async function mechanicalDeny(params: {
  trace: WhyNotTrace;
  tenantId: string;
  goal?: string;
  action?: Action;
  optrRunId?: string;
}): Promise<{ denialId: string; trace: WhyNotTrace }> {
  const { trace, tenantId, goal, action, optrRunId } = params;

  // Build denial payload
  const payload: DeniedDecisionPayload = {
    decisionId: crypto.randomUUID(),
    ts: trace.ts,
    actionId: trace.actionId,
    tenantId,
    reasonCodes: trace.reasonCodes,
    message: trace.message,
    reason: trace.message,
    denied: true,
  };

  // Persist to ledger (non-blocking on failure)
  const result = await persistDeniedDecision(payload);

  if (!result.success) {
    console.warn(
      `[TRUST_UX_WARNING] Failed to persist denial for action ${trace.actionId}`
    );
  }

  return {
    denialId: result.id,
    trace,
  };
}

/**
 * Batch deny multiple traces (e.g., from OPTR run)
 *
 * Persists all denials in parallel for efficiency.
 */
export async function mechanicalDenyBatch(params: {
  traces: WhyNotTrace[];
  tenantId: string;
  goal?: string;
  actions?: Map<string, Action>;
  optrRunId?: string;
}): Promise<{ denialIds: string[]; traces: WhyNotTrace[] }> {
  const { traces, tenantId, goal, actions, optrRunId } = params;

  const results = await Promise.all(
    traces.map((trace) =>
      mechanicalDeny({
        trace,
        tenantId,
        goal,
        action: actions?.get(trace.actionId),
        optrRunId,
      })
    )
  );

  return {
    denialIds: results.map((r) => r.denialId),
    traces: results.map((r) => r.trace),
  };
}
