/**
 * Session Completion Runtime - Integration Helpers
 * 
 * Helper functions for integrating session completion capture into existing systems.
 */

import { SessionCompletionEvent, SessionMetadata, UsageMetrics, UserContext } from "./types";
import { getRuntime } from "./runtime";

/**
 * Capture a chat session completion
 * Simplified helper for common use case
 */
export async function captureChatSessionCompletion(params: {
  sessionId: string;
  userId: string;
  organizationId: string;
  startTime: string;
  endTime: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  outcome: "success" | "error" | "timeout" | "user_terminated";
  errorMessage?: string;
}): Promise<void> {
  const event: SessionCompletionEvent = {
    event_type: "session.completed",
    event_id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    session: {
      session_id: params.sessionId,
      session_type: "chat",
      start_time: params.startTime,
      end_time: params.endTime,
      duration_ms: new Date(params.endTime).getTime() - new Date(params.startTime).getTime(),
    },
    user: {
      user_id: params.userId,
      organization_id: params.organizationId,
    },
    usage: {
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      total_tokens: params.inputTokens + params.outputTokens,
      model: params.model,
      estimated_cost_usd: estimateCost(params.inputTokens, params.outputTokens, params.model),
    },
    outcome: {
      status: params.outcome,
      error_message: params.errorMessage,
    },
  };

  const runtime = getRuntime();
  await runtime.capture(event);
}

/**
 * Capture a realtime session completion (voice or multimodal)
 * Simplified helper for low-latency Realtime API sessions
 */
export async function captureRealtimeSessionCompletion(params: {
  sessionId: string;
  userId: string;
  organizationId: string;
  startTime: string;
  endTime: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
  outcome: "success" | "error" | "timeout" | "user_terminated";
  errorMessage?: string;
  inputModality?: "audio" | "text" | "multimodal";
  transport?: "webrtc" | "websocket" | "sip";
}): Promise<void> {
  const event: SessionCompletionEvent = {
    event_type: "session.completed",
    event_id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    session: {
      session_id: params.sessionId,
      session_type: "realtime",
      start_time: params.startTime,
      end_time: params.endTime,
      duration_ms: new Date(params.endTime).getTime() - new Date(params.startTime).getTime(),
    },
    user: {
      user_id: params.userId,
      organization_id: params.organizationId,
    },
    usage: {
      input_tokens: params.inputTokens,
      output_tokens: params.outputTokens,
      total_tokens: params.inputTokens + params.outputTokens,
      model: params.model,
      estimated_cost_usd: estimateCost(params.inputTokens, params.outputTokens, params.model),
    },
    outcome: {
      status: params.outcome,
      error_message: params.errorMessage,
    },
    metadata: {
      input_modality: params.inputModality,
      transport: params.transport,
    },
  };

  const runtime = getRuntime();
  await runtime.capture(event);
}

/**
 * Estimate cost based on token usage and model
 */
export function estimateCost(inputTokens: number, outputTokens: number, model: string): number {
  // Pricing per 1K tokens (as of Dec 2025)
  const pricing: Record<string, { input: number; output: number }> = {
    "gpt-4": { input: 0.03, output: 0.06 },
    "gpt-4-turbo": { input: 0.01, output: 0.03 },
    "gpt-3.5-turbo": { input: 0.0015, output: 0.002 },
  };

  const modelPricing = pricing[model] || pricing["gpt-4"];
  
  const inputCost = (inputTokens / 1000) * modelPricing.input;
  const outputCost = (outputTokens / 1000) * modelPricing.output;
  
  return inputCost + outputCost;
}

/**
 * Extract session metadata from HTTP request
 * Useful for API route handlers
 */
export function extractSessionMetadata(req: {
  headers: Record<string, string | string[] | undefined>;
  body: any;
}): Partial<SessionMetadata> {
  const sessionId = 
    (typeof req.headers["x-session-id"] === "string" ? req.headers["x-session-id"] : undefined) ||
    req.body?.session_id;
    
  const startTime = 
    (typeof req.headers["x-session-start"] === "string" ? req.headers["x-session-start"] : undefined) ||
    req.body?.start_time;

  return {
    session_id: sessionId,
    start_time: startTime,
    session_type: "api",
  };
}

/**
 * Extract user context from HTTP request
 */
export function extractUserContext(req: {
  headers: Record<string, string | string[] | undefined>;
  body: any;
}): Partial<UserContext> {
  const userId = 
    (typeof req.headers["x-user-id"] === "string" ? req.headers["x-user-id"] : undefined) ||
    req.body?.user_id;
    
  const orgId = 
    (typeof req.headers["x-organization-id"] === "string" ? req.headers["x-organization-id"] : undefined) ||
    req.body?.organization_id;

  return {
    user_id: userId,
    organization_id: orgId,
  };
}
