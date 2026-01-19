/**
 * Enhanced Systems Integration Example
 * TIMESTAMP: 2026-01-19T23:13:00Z
 *
 * Demonstrates how the enhanced systems work together:
 * - Knowledge persistence
 * - Dynamic configuration
 * - Recursive learning
 * - Runtime resiliency
 * - Self-correcting states
 */

import {
  AdaptiveKnowledgeStore,
  MetaDecisionLogger,
  DynamicConfigManager,
  config,
  SelfCoachingOptimizer,
  computeCircuitState,
  CircuitBreakerConfig,
  CircuitBreakerState,
  SelfCorrectingState,
  AuditLogger,
} from "../src/canon";

/**
 * Example: Complete system integration
 */
export async function demonstrateEnhancedSystems() {
  console.log("🚀 Enhanced Systems Integration Demo\n");

  // =========================================================
  // 1. Knowledge Persistence & Meta-Decision Logging
  // =========================================================
  console.log("📚 1. Knowledge Persistence System");
  
  const knowledgeStore = new AdaptiveKnowledgeStore();
  const metaLogger = new MetaDecisionLogger();

  // Record some decisions
  for (let i = 0; i < 5; i++) {
    metaLogger.log({
      id: `decision_${i}`,
      ts: new Date().toISOString(),
      decisionType: "DECIDE",
      actionId: `action_${i}`,
      stableKey: `key_${i}`,
      outcome: i % 2 === 0 ? "APPROVED" : "DENIED",
      reasonCodes: i % 2 === 0 ? [] : ["MISSING_PREREQUISITES"],
      features: { ttv: 5 + i, cost: 0.1 * i, risk: 0.05 },
      durationMs: 10 + i * 5,
    });
  }

  const analysis = metaLogger.analyzePatterns();
  console.log(`  ✓ Logged ${metaLogger.getRecent().length} decisions`);
  console.log(`  ✓ Approval rate: ${(analysis.approvalRate * 100).toFixed(1)}%`);
  console.log(`  ✓ Avg duration: ${analysis.avgDuration.toFixed(1)}ms\n`);

  // =========================================================
  // 2. Dynamic Configuration
  // =========================================================
  console.log("⚙️  2. Dynamic Configuration System");

  const configManager = new DynamicConfigManager("development");

  // Register multi-context configurations
  config<number>("optr.weight.ttv")
    .forDevelopment(1.0)
    .forProduction(1.5)
    .withMetadata({ description: "TTV weight in OPTR scoring" })
    .build(configManager);

  config<string>("api.endpoint")
    .forDevelopment("http://localhost:3000")
    .forProduction("https://api.bickford.com")
    .build(configManager);

  const ttvWeight = configManager.resolve<number>("optr.weight.ttv");
  console.log(`  ✓ Current context: ${configManager.getContext()}`);
  console.log(`  ✓ TTV weight: ${ttvWeight?.value}`);

  // Simulate context transition
  configManager.transition("production", "deployment");
  const prodEndpoint = configManager.resolve<string>("api.endpoint");
  console.log(`  ✓ Transitioned to: ${configManager.getContext()}`);
  console.log(`  ✓ API endpoint: ${prodEndpoint?.value}\n`);

  // =========================================================
  // 3. Recursive Learning System
  // =========================================================
  console.log("🧠 3. Recursive Learning System");

  const optimizer = new SelfCoachingOptimizer({
    complexity: 0.8,
    confidence: 0.9,
    risk: 0.5,
  });

  // Record some executions
  const executions = [
    { action: "process_intent", features: { complexity: 0.7, confidence: 0.9 }, actual: 3.5, predicted: 4.0 },
    { action: "process_intent", features: { complexity: 0.8, confidence: 0.8 }, actual: 4.2, predicted: 4.5 },
    { action: "validate_canon", features: { complexity: 0.5, confidence: 0.95 }, actual: 1.5, predicted: 2.0 },
    { action: "validate_canon", features: { complexity: 0.6, confidence: 0.9 }, actual: 1.8, predicted: 2.2 },
  ];

  for (const exec of executions) {
    optimizer.recordExecution(exec.action, exec.features, exec.actual, exec.predicted);
  }

  const coaching = optimizer.coach();
  console.log(`  ✓ Learning signals: ${coaching.progress.totalSignals}`);
  console.log(`  ✓ Model confidence: ${(coaching.progress.performance.confidence * 100).toFixed(1)}%`);
  console.log(`  ✓ Insights found: ${coaching.insights.length}`);
  
  if (coaching.recommendations.length > 0) {
    console.log(`  ✓ Top recommendation: ${coaching.recommendations[0]}\n`);
  }

  // =========================================================
  // 4. Runtime Resiliency
  // =========================================================
  console.log("🛡️  4. Runtime Resiliency System");

  const circuitConfig: CircuitBreakerConfig = {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 5000,
    resetTimeout: 10000,
  };

  let circuitState: CircuitBreakerState = {
    state: "CLOSED",
    failures: 0,
    successes: 0,
    lastFailure: null,
    lastSuccess: null,
  };

  // Simulate some failures
  for (let i = 0; i < 3; i++) {
    circuitState = computeCircuitState(circuitState, circuitConfig, {
      type: "FAILURE",
      ts: Date.now() + i * 1000,
    });
  }

  console.log(`  ✓ Circuit state after failures: ${circuitState.state}`);
  console.log(`  ✓ Failure count: ${circuitState.failures}`);

  // Simulate recovery
  await new Promise(resolve => setTimeout(resolve, 100));
  circuitState = computeCircuitState(circuitState, circuitConfig, {
    type: "SUCCESS",
    ts: Date.now() + 11000,
  });

  console.log(`  ✓ Circuit state after recovery: ${circuitState.state}\n`);

  // =========================================================
  // 5. Self-Correcting States & Audit
  // =========================================================
  console.log("🔧 5. Self-Correcting States & Audit");

  interface AppState {
    value: number;
    status: "active" | "inactive";
  }

  const stateManager = new SelfCorrectingState<AppState>(
    (state) => state.value > 0 && state.value < 100,
    (state) => ({
      ...state,
      value: Math.max(1, Math.min(99, state.value)),
    })
  );

  const auditLogger = new AuditLogger();

  // Try invalid state
  const invalidState: AppState = { value: -5, status: "active" };
  const result = stateManager.validateAndCorrect(invalidState, "boundary-violation");

  console.log(`  ✓ Invalid state corrected: ${result.corrected}`);
  console.log(`  ✓ Corrected value: ${result.state.value}`);

  // Log audit entry
  auditLogger.log({
    category: "STATE",
    severity: "WARN",
    action: "state_correction",
    actor: "system",
    details: { correction: result.correction },
  });

  const auditReport = auditLogger.generateReport(3600000);
  console.log(`  ✓ Audit entries: ${auditReport.totalEntries}`);
  console.log(`  ✓ Active bottlenecks: ${auditReport.activeBottlenecks}\n`);

  // =========================================================
  // Summary
  // =========================================================
  console.log("✅ Enhanced Systems Integration Demo Complete");
  console.log("\nAll systems are working together:");
  console.log("  • Knowledge persistence stores decision metadata");
  console.log("  • Dynamic config adapts to context changes");
  console.log("  • Learning system improves predictions over time");
  console.log("  • Resiliency utilities protect against failures");
  console.log("  • Self-correction maintains system integrity");
  console.log("  • Audit system tracks all operations");
}

// Run the demo
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateEnhancedSystems().catch(console.error);
}
