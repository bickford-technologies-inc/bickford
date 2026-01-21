/**
 * Session Completion Runtime - Type Definitions
 * Core types for event capture, validation, and routing
 */

export type ISO8601 = string;

export type SessionType = "chat" | "api" | "autonomous" | "webhook" | "realtime";

export type OutcomeStatus = "success" | "error" | "timeout" | "user_terminated";

export type DestinationType = "database" | "webhook" | "log" | "analytics";

/**
 * Session metadata captured at completion
 */
export type SessionMetadata = {
  session_id: string;
  session_type: SessionType;
  start_time: ISO8601;
  end_time: ISO8601;
  duration_ms: number;
};

/**
 * User/tenant context
 */
export type UserContext = {
  user_id: string;
  organization_id: string;
  tier?: "free" | "pro" | "enterprise";
};

/**
 * Token usage and cost tracking
 */
export type UsageMetrics = {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  model: string;
  estimated_cost_usd: number;
};

/**
 * Session outcome
 */
export type SessionOutcome = {
  status: OutcomeStatus;
  final_message?: string;
  error_code?: string;
  error_message?: string;
};

/**
 * Complete session completion event
 */
export type SessionCompletionEvent = {
  event_type: "session.completed";
  event_id: string;
  timestamp: ISO8601;
  session: SessionMetadata;
  user: UserContext;
  usage: UsageMetrics;
  outcome: SessionOutcome;
  metadata?: Record<string, any>;
};

/**
 * Destination configuration
 */
export type SessionDestination = {
  type: DestinationType;
  enabled: boolean;
  config: {
    // Database
    connectionString?: string;
    table?: string;
    
    // Webhook
    url?: string;
    headers?: Record<string, string>;
    
    // Log
    logLevel?: "debug" | "info" | "warn" | "error";
    logPath?: string;
  };
};

/**
 * Runtime configuration
 */
export type SessionCompletionConfig = {
  bufferSize: number;
  flushIntervalMs: number;
  destinations: SessionDestination[];
  retryAttempts: number;
  retryDelayMs: number;
};

/**
 * Runtime metrics
 */
export type SessionCompletionMetrics = {
  eventsCaptured: number;
  eventsRoutedSuccess: number;
  eventsRoutedFailure: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  bufferUtilization: number;
  destinationStats: Record<DestinationType, {
    sent: number;
    success: number;
    failure: number;
  }>;
};

/**
 * Validation result
 */
export type ValidationResult = {
  valid: boolean;
  errors?: Array<{
    field: string;
    message: string;
  }>;
};
