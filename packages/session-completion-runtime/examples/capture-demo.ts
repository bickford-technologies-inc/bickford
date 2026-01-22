#!/usr/bin/env node
/**
 * Session Completion Runtime Demo
 * Demonstrates event capture, buffering, and routing
 */

import {
  SessionCompletionRuntime,
  SessionCompletionEvent,
  SessionCompletionConfig,
} from "../../session-completion-runtime/src";

// Create configuration
const config: SessionCompletionConfig = {
  bufferSize: 10,
  flushIntervalMs: 2000,
  retryAttempts: 2,
  retryDelayMs: 500,
  destinations: [
    {
      type: "log",
      enabled: true,
      config: { logLevel: "info" },
    },
    {
      type: "database",
      enabled: true,
      config: {
        connectionString: "postgresql://localhost/demo",
        table: "session_completions",
      },
    },
  ],
};

// Initialize runtime
console.log("\n🚀 SESSION COMPLETION RUNTIME DEMO\n");
console.log("=".repeat(60));
console.log("\nConfiguration:");
console.log(`  Buffer Size: ${config.bufferSize} events`);
console.log(`  Flush Interval: ${config.flushIntervalMs}ms`);
console.log(`  Destinations: ${config.destinations.length}`);
config.destinations.forEach((dest) => {
  console.log(`    - ${dest.type} (${dest.enabled ? "enabled" : "disabled"})`);
});

const runtime = new SessionCompletionRuntime(config);

// Generate sample events
const generateEvent = (index: number): SessionCompletionEvent => {
  const now = new Date();
  const startTime = new Date(now.getTime() - 300000); // 5 minutes ago
  
  const sessionType = ["chat", "api", "autonomous", "realtime"][index % 4] as any;
  const metadata =
    sessionType === "realtime"
      ? {
          input_modality: ["audio", "text", "multimodal"][index % 3],
          transport: ["webrtc", "websocket", "sip"][index % 3],
        }
      : undefined;

  return {
    event_type: "session.completed",
    event_id: `evt_demo_${now.getTime()}_${index}`,
    timestamp: now.toISOString(),
    session: {
      session_id: `sess_demo_${index}`,
      session_type: sessionType,
      start_time: startTime.toISOString(),
      end_time: now.toISOString(),
      duration_ms: 300000,
    },
    user: {
      user_id: `user_${index % 5}`,
      organization_id: `org_demo`,
      tier: ["free", "pro", "enterprise"][index % 3] as any,
    },
    usage: {
      input_tokens: 1000 + index * 100,
      output_tokens: 500 + index * 50,
      total_tokens: 1500 + index * 150,
      model: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"][index % 3],
      estimated_cost_usd: 0.02 + index * 0.01,
    },
    outcome: {
      status: ["success", "success", "success", "error"][index % 4] as any,
      error_message: index % 4 === 3 ? "Timeout error" : undefined,
    },
    metadata,
  };
};

// Capture events
console.log("\n\n" + "=".repeat(60));
console.log("CAPTURING EVENTS\n");

async function captureEvents() {
  for (let i = 0; i < 15; i++) {
    const event = generateEvent(i);
    await runtime.capture(event);
    console.log(`✓ Captured event ${i + 1}/15: ${event.session.session_id} (${event.outcome.status})`);
    
    // Small delay to simulate real timing
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

captureEvents()
  .then(() => {
    console.log("\n\n" + "=".repeat(60));
    console.log("METRICS AFTER CAPTURE\n");
    
    const metrics = runtime.getMetrics();
    console.log(`Events Captured: ${metrics.eventsCaptured}`);
    console.log(`Events Routed (Success): ${metrics.eventsRoutedSuccess}`);
    console.log(`Events Routed (Failure): ${metrics.eventsRoutedFailure}`);
    console.log(`Average Latency: ${metrics.averageLatencyMs.toFixed(2)}ms`);
    console.log(`P95 Latency: ${metrics.p95LatencyMs.toFixed(2)}ms`);
    console.log(`P99 Latency: ${metrics.p99LatencyMs.toFixed(2)}ms`);
    console.log(`Buffer Utilization: ${metrics.bufferUtilization.toFixed(1)}%`);
    
    console.log("\nDestination Stats:");
    Object.entries(metrics.destinationStats).forEach(([dest, stats]) => {
      if (stats.sent > 0) {
        console.log(`  ${dest}:`);
        console.log(`    - Sent: ${stats.sent}`);
        console.log(`    - Success: ${stats.success}`);
        console.log(`    - Failure: ${stats.failure}`);
        console.log(`    - Success Rate: ${((stats.success / stats.sent) * 100).toFixed(1)}%`);
      }
    });
    
    // Final flush
    console.log("\n\n" + "=".repeat(60));
    console.log("FINAL FLUSH\n");
    
    return runtime.flush();
  })
  .then(() => {
    const finalMetrics = runtime.getMetrics();
    console.log(`✓ Flush complete`);
    console.log(`  Final events routed: ${finalMetrics.eventsRoutedSuccess}`);
    
    // Stop runtime
    runtime.stop();
    
    console.log("\n" + "=".repeat(60));
    console.log("\nDemo complete! 🎉\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    runtime.stop();
    process.exit(1);
  });
