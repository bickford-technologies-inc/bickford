/**
 * Runtime Denial Helper
 * TIMESTAMP: 2026-02-08T00:00:00Z
 */

import type { DenialReasonCode, ISO8601 } from "@bickford/types";
import type { WhyNotTrace } from "@bickford/authority";

export function deny(params: {
  actionId: string;
  timestamp: ISO8601;
  reason: DenialReasonCode;
  message: string;
  context?: Record<string, unknown>;
}): WhyNotTrace {
  return {
    ts: params.timestamp,
    actionId: params.actionId,
    denied: true,
    reasonCodes: [params.reason],
    message: params.message,
    context: params.context,
  };
}
