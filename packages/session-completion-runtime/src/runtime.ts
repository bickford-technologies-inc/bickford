/**
 * Session Completion Runtime - Core Implementation
 * 
 * Captures session completion events, validates schema, buffers, and routes to destinations.
 * Design: Lightweight, stateless, horizontally scalable.
 */

import {
  SessionCompletionEvent,
  SessionCompletionConfig,
  SessionCompletionMetrics,
  SessionDestination,
  ValidationResult,
  DestinationType,
} from "./types";

export class SessionCompletionRuntime {
  private buffer: SessionCompletionEvent[] = [];
  private metrics: SessionCompletionMetrics;
  private config: SessionCompletionConfig;
  private flushTimer: NodeJS.Timeout | null = null;
  private latencySamples: number[] = [];

  constructor(config: SessionCompletionConfig) {
    this.config = config;
    this.metrics = this.initMetrics();
    this.startFlushTimer();
  }

  /**
   * Capture a session completion event
   */
  public async capture(event: SessionCompletionEvent): Promise<void> {
    const startTime = Date.now();

    // Validate event schema
    const validation = this.validate(event);
    if (!validation.valid) {
      throw new Error(`Invalid event: ${JSON.stringify(validation.errors)}`);
    }

    // Add to buffer
    this.buffer.push(event);
    this.metrics.eventsCaptured++;

    // Flush if buffer is full
    if (this.buffer.length >= this.config.bufferSize) {
      await this.flush();
    }

    // Track latency
    const latency = Date.now() - startTime;
    this.recordLatency(latency);
  }

  /**
   * Validate event against schema
   */
  private validate(event: SessionCompletionEvent): ValidationResult {
    const errors: Array<{ field: string; message: string }> = [];

    if (!event.event_id) {
      errors.push({ field: "event_id", message: "Required field missing" });
    }
    if (!event.session?.session_id) {
      errors.push({ field: "session.session_id", message: "Required field missing" });
    }
    if (!event.timestamp) {
      errors.push({ field: "timestamp", message: "Required field missing" });
    }
    if (typeof event.usage?.total_tokens !== "number") {
      errors.push({ field: "usage.total_tokens", message: "Must be a number" });
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Flush buffer to all destinations
   */
  public async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const events = [...this.buffer];
    this.buffer = [];

    // Route to each enabled destination
    const promises = this.config.destinations
      .filter((dest) => dest.enabled)
      .map((dest) => this.routeToDestination(events, dest));

    await Promise.allSettled(promises);
  }

  /**
   * Route events to a specific destination
   */
  private async routeToDestination(
    events: SessionCompletionEvent[],
    destination: SessionDestination
  ): Promise<void> {
    const destType = destination.type;

    try {
      switch (destType) {
        case "database":
          await this.sendToDatabase(events, destination);
          break;
        case "webhook":
          await this.sendToWebhook(events, destination);
          break;
        case "log":
          await this.sendToLog(events, destination);
          break;
        case "analytics":
          await this.sendToAnalytics(events, destination);
          break;
      }

      // Update success metrics
      this.metrics.eventsRoutedSuccess += events.length;
      this.metrics.destinationStats[destType].sent += events.length;
      this.metrics.destinationStats[destType].success += events.length;
    } catch (error) {
      // Update failure metrics
      this.metrics.eventsRoutedFailure += events.length;
      this.metrics.destinationStats[destType].failure += events.length;

      // Retry logic (simplified)
      if (this.config.retryAttempts > 0) {
        await this.retryWithBackoff(events, destination);
      }
    }
  }

  /**
   * Send to database destination
   */
  private async sendToDatabase(
    events: SessionCompletionEvent[],
    destination: SessionDestination
  ): Promise<void> {
    // Placeholder: In real implementation, use Prisma/Postgres
    console.log(`[DATABASE] Storing ${events.length} events to ${destination.config.table}`);
    
    // Simulate async database write
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  /**
   * Send to webhook destination
   */
  private async sendToWebhook(
    events: SessionCompletionEvent[],
    destination: SessionDestination
  ): Promise<void> {
    if (!destination.config.url) {
      throw new Error("Webhook URL not configured");
    }

    // Placeholder: In real implementation, use fetch
    console.log(`[WEBHOOK] Sending ${events.length} events to ${destination.config.url}`);
    
    // Simulate HTTP request
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  /**
   * Send to log destination
   */
  private async sendToLog(
    events: SessionCompletionEvent[],
    destination: SessionDestination
  ): Promise<void> {
    const logLevel = destination.config.logLevel || "info";
    
    for (const event of events) {
      console.log(`[${logLevel.toUpperCase()}] Session ${event.session.session_id} completed: ${event.outcome.status}`);
    }
  }

  /**
   * Send to analytics destination
   */
  private async sendToAnalytics(
    events: SessionCompletionEvent[],
    destination: SessionDestination
  ): Promise<void> {
    // Placeholder: In real implementation, send to analytics service
    console.log(`[ANALYTICS] Processing ${events.length} events`);
    
    await new Promise((resolve) => setTimeout(resolve, 15));
  }

  /**
   * Retry with exponential backoff
   */
  private async retryWithBackoff(
    events: SessionCompletionEvent[],
    destination: SessionDestination
  ): Promise<void> {
    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      const delay = this.config.retryDelayMs * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));

      try {
        await this.routeToDestination(events, destination);
        return; // Success
      } catch (error) {
        if (attempt === this.config.retryAttempts) {
          console.error(`Failed after ${attempt} retries:`, error);
        }
      }
    }
  }

  /**
   * Start automatic flush timer
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      void this.flush();
    }, this.config.flushIntervalMs);
  }

  /**
   * Stop flush timer
   */
  public stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    void this.flush(); // Final flush
  }

  /**
   * Get current metrics
   */
  public getMetrics(): SessionCompletionMetrics {
    // Calculate percentiles
    if (this.latencySamples.length > 0) {
      const sorted = [...this.latencySamples].sort((a, b) => a - b);
      const p95Index = Math.floor(sorted.length * 0.95);
      const p99Index = Math.floor(sorted.length * 0.99);
      
      this.metrics.p95LatencyMs = sorted[p95Index] || 0;
      this.metrics.p99LatencyMs = sorted[p99Index] || 0;
      this.metrics.averageLatencyMs = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    }

    // Calculate buffer utilization
    this.metrics.bufferUtilization = (this.buffer.length / this.config.bufferSize) * 100;

    return { ...this.metrics };
  }

  /**
   * Record latency sample
   */
  private recordLatency(latencyMs: number): void {
    this.latencySamples.push(latencyMs);
    
    // Keep only last 1000 samples
    if (this.latencySamples.length > 1000) {
      this.latencySamples.shift();
    }
  }

  /**
   * Initialize metrics object
   */
  private initMetrics(): SessionCompletionMetrics {
    return {
      eventsCaptured: 0,
      eventsRoutedSuccess: 0,
      eventsRoutedFailure: 0,
      averageLatencyMs: 0,
      p95LatencyMs: 0,
      p99LatencyMs: 0,
      bufferUtilization: 0,
      destinationStats: {
        database: { sent: 0, success: 0, failure: 0 },
        webhook: { sent: 0, success: 0, failure: 0 },
        log: { sent: 0, success: 0, failure: 0 },
        analytics: { sent: 0, success: 0, failure: 0 },
      },
    };
  }
}

/**
 * Singleton instance (for convenience)
 */
let runtimeInstance: SessionCompletionRuntime | null = null;

export function getRuntime(config?: SessionCompletionConfig): SessionCompletionRuntime {
  if (!runtimeInstance && config) {
    runtimeInstance = new SessionCompletionRuntime(config);
  }
  if (!runtimeInstance) {
    throw new Error("Runtime not initialized. Call getRuntime(config) first.");
  }
  return runtimeInstance;
}

export function createDefaultConfig(): SessionCompletionConfig {
  return {
    bufferSize: 100,
    flushIntervalMs: 5000,
    retryAttempts: 3,
    retryDelayMs: 1000,
    destinations: [
      {
        type: "log",
        enabled: true,
        config: { logLevel: "info" },
      },
    ],
  };
}
