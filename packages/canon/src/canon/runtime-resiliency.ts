/**
 * Pure Runtime Resiliency Utilities
 * TIMESTAMP: 2026-01-19T23:13:00Z
 *
 * Lightweight, pure functions for runtime intelligence and resiliency.
 * No side effects, minimal dependencies, maximum reliability.
 */

/**
 * Circuit breaker state
 */
export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number; // ms
  resetTimeout: number; // ms
}

export interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure: number | null;
  lastSuccess: number | null;
}

/**
 * Pure function: Calculate next circuit breaker state
 */
export function computeCircuitState(
  current: CircuitBreakerState,
  config: CircuitBreakerConfig,
  event: { type: "SUCCESS" | "FAILURE"; ts: number }
): CircuitBreakerState {
  const next = { ...current };

  if (event.type === "SUCCESS") {
    next.successes++;
    next.lastSuccess = event.ts;

    if (current.state === "HALF_OPEN") {
      if (next.successes >= config.successThreshold) {
        next.state = "CLOSED";
        next.failures = 0;
        next.successes = 0;
      }
    } else if (current.state === "OPEN") {
      const timeSinceFailure = event.ts - (current.lastFailure || 0);
      if (timeSinceFailure >= config.resetTimeout) {
        next.state = "HALF_OPEN";
        next.successes = 1;
        next.failures = 0;
      }
    }
  } else {
    next.failures++;
    next.lastFailure = event.ts;

    if (current.state === "CLOSED" || current.state === "HALF_OPEN") {
      if (next.failures >= config.failureThreshold) {
        next.state = "OPEN";
        next.successes = 0;
      }
    }
  }

  return next;
}

/**
 * Pure function: Should allow request based on circuit state
 */
export function shouldAllowRequest(
  state: CircuitBreakerState,
  config: CircuitBreakerConfig,
  now: number
): boolean {
  if (state.state === "CLOSED") return true;
  if (state.state === "HALF_OPEN") return true;

  // OPEN: check if enough time has passed
  const timeSinceFailure = now - (state.lastFailure || 0);
  return timeSinceFailure >= config.resetTimeout;
}

/**
 * Pure function: Exponential backoff calculation
 */
export function computeBackoff(
  attempt: number,
  baseMs: number = 100,
  maxMs: number = 30000,
  jitter: number = 0.1
): number {
  const exponential = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  const jitterAmount = exponential * jitter * (Math.random() - 0.5);
  return Math.max(0, exponential + jitterAmount);
}

/**
 * Pure function: Rate limit check using token bucket algorithm
 */
export interface TokenBucket {
  tokens: number;
  capacity: number;
  refillRate: number; // tokens per second
  lastRefill: number;
}

export function computeTokenBucket(
  current: TokenBucket,
  now: number,
  requestTokens: number = 1
): { allowed: boolean; bucket: TokenBucket } {
  // Calculate tokens to add since last refill
  const timeSinceRefill = (now - current.lastRefill) / 1000; // seconds
  const tokensToAdd = timeSinceRefill * current.refillRate;

  const newTokens = Math.min(current.capacity, current.tokens + tokensToAdd);

  if (newTokens >= requestTokens) {
    return {
      allowed: true,
      bucket: {
        ...current,
        tokens: newTokens - requestTokens,
        lastRefill: now,
      },
    };
  }

  return {
    allowed: false,
    bucket: {
      ...current,
      tokens: newTokens,
      lastRefill: now,
    },
  };
}

/**
 * Pure function: Health check aggregation
 */
export interface HealthCheck {
  name: string;
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  latency?: number;
  message?: string;
}

export interface AggregateHealth {
  overall: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  checks: HealthCheck[];
  healthyCount: number;
  degradedCount: number;
  unhealthyCount: number;
}

export function aggregateHealth(checks: HealthCheck[]): AggregateHealth {
  const healthyCount = checks.filter((c) => c.status === "HEALTHY").length;
  const degradedCount = checks.filter((c) => c.status === "DEGRADED").length;
  const unhealthyCount = checks.filter((c) => c.status === "UNHEALTHY").length;

  let overall: AggregateHealth["overall"] = "HEALTHY";

  if (unhealthyCount > 0) {
    overall = "UNHEALTHY";
  } else if (degradedCount > 0) {
    overall = "DEGRADED";
  }

  return {
    overall,
    checks,
    healthyCount,
    degradedCount,
    unhealthyCount,
  };
}

/**
 * Pure function: Timeout detection
 */
export function isTimedOut(startTime: number, now: number, timeoutMs: number): boolean {
  return now - startTime >= timeoutMs;
}

/**
 * Pure function: Retry decision
 */
export interface RetryPolicy {
  maxAttempts: number;
  retryableErrors: string[];
  backoffStrategy: "linear" | "exponential";
}

export function shouldRetry(
  attempt: number,
  error: { code?: string; message?: string },
  policy: RetryPolicy
): boolean {
  if (attempt >= policy.maxAttempts) return false;

  // Check if error is retryable
  if (policy.retryableErrors.length > 0) {
    const errorCode = error.code || error.message || "";
    return policy.retryableErrors.some((retryable) =>
      errorCode.includes(retryable)
    );
  }

  return true; // Retry all errors by default
}

/**
 * Pure function: Calculate percentile from sorted array
 */
export function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  if (p <= 0) return sortedValues[0];
  if (p >= 100) return sortedValues[sortedValues.length - 1];

  const index = (p / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

/**
 * Pure function: Calculate moving average
 */
export function movingAverage(values: number[], windowSize: number): number[] {
  if (values.length === 0 || windowSize <= 0) return [];

  const result: number[] = [];
  let sum = 0;

  for (let i = 0; i < values.length; i++) {
    sum += values[i];

    if (i >= windowSize) {
      sum -= values[i - windowSize];
    }

    const count = Math.min(i + 1, windowSize);
    result.push(sum / count);
  }

  return result;
}

/**
 * Pure function: Detect anomaly using standard deviation
 */
export function isAnomaly(
  value: number,
  mean: number,
  stdDev: number,
  threshold: number = 3
): boolean {
  const zScore = Math.abs((value - mean) / stdDev);
  return zScore > threshold;
}

/**
 * Pure function: Calculate standard deviation
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Pure function: Graceful degradation decision
 */
export interface DegradationLevel {
  level: "FULL" | "PARTIAL" | "MINIMAL" | "EMERGENCY";
  features: string[];
}

export function computeDegradationLevel(
  health: AggregateHealth,
  loadPercent: number
): DegradationLevel {
  if (health.overall === "UNHEALTHY" || loadPercent > 95) {
    return {
      level: "EMERGENCY",
      features: ["read-only"],
    };
  }

  if (health.overall === "DEGRADED" || loadPercent > 80) {
    return {
      level: "MINIMAL",
      features: ["read", "write-critical"],
    };
  }

  if (loadPercent > 60) {
    return {
      level: "PARTIAL",
      features: ["read", "write", "analytics-disabled"],
    };
  }

  return {
    level: "FULL",
    features: ["read", "write", "analytics", "ml"],
  };
}

/**
 * Pure function: Merge multiple states into consensus
 */
export function consensusState<T>(
  states: T[],
  validator: (state: T) => boolean
): T | null {
  if (states.length === 0) return null;

  // Simple majority consensus
  const validStates = states.filter(validator);
  if (validStates.length === 0) return null;

  // Return most common state
  const counts = new Map<string, { state: T; count: number }>();

  for (const state of validStates) {
    const key = JSON.stringify(state);
    const existing = counts.get(key);
    if (existing) {
      existing.count++;
    } else {
      counts.set(key, { state, count: 1 });
    }
  }

  let max: { state: T; count: number } | null = null;
  for (const entry of counts.values()) {
    if (!max || entry.count > max.count) {
      max = entry;
    }
  }

  return max ? max.state : null;
}
