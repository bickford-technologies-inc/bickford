/**
 * Demo script showing the non-interference evaluation in action
 * This demonstrates the core functionality without requiring a running server
 */

import { evaluateNonInterference } from "../packages/optr/src/nonInterference";

console.log("=".repeat(70));
console.log("MULTI-AGENT NON-INTERFERENCE DEMO");
console.log("=".repeat(70));
console.log();

// Scenario 1: Safe action (no TTV increase)
console.log("📊 SCENARIO 1: Safe Action");
console.log("-".repeat(70));

const actor1 = { agentId: "agent-A", ttvBaseline: 100 };
const others1 = [
  { agentId: "agent-B", ttvBaseline: 150 },
  { agentId: "agent-C", ttvBaseline: 200 },
];
const projectedTTV1: Record<string, number> = {
  "agent-B": 150, // No change
  "agent-C": 200, // No change
};

const result1 = evaluateNonInterference(actor1, others1, projectedTTV1);

console.log("Input:");
console.log(
  `  Actor: ${actor1.agentId} (baseline TTV: ${actor1.ttvBaseline}ms)`,
);
console.log(`  Other agents:`);
others1.forEach((a) =>
  console.log(
    `    - ${a.agentId}: baseline=${a.ttvBaseline}ms, projected=${projectedTTV1[a.agentId]}ms`,
  ),
);
console.log();
console.log("Result:");
console.log(`  ✅ Allowed: ${result1.allowed}`);
console.log(`  Reason: ${result1.reason}`);
console.log();

// Scenario 2: Harmful action (TTV increase detected)
console.log("📊 SCENARIO 2: Harmful Action");
console.log("-".repeat(70));

const actor2 = { agentId: "agent-A", ttvBaseline: 100 };
const others2 = [
  { agentId: "agent-B", ttvBaseline: 150 },
  { agentId: "agent-C", ttvBaseline: 200 },
];
const projectedTTV2: Record<string, number> = {
  "agent-B": 152.4, // Increase by 2.4ms
  "agent-C": 200, // No change
};

const result2 = evaluateNonInterference(actor2, others2, projectedTTV2);

console.log("Input:");
console.log(
  `  Actor: ${actor2.agentId} (baseline TTV: ${actor2.ttvBaseline}ms)`,
);
console.log(`  Other agents:`);
others2.forEach((a) =>
  console.log(
    `    - ${a.agentId}: baseline=${a.ttvBaseline}ms, projected=${projectedTTV2[a.agentId]}ms`,
  ),
);
console.log();
console.log("Result:");
console.log(`  ❌ Allowed: ${result2.allowed}`);
console.log(`  Reason: ${result2.reason}`);
console.log();

// Scenario 3: Multiple agents affected
console.log("📊 SCENARIO 3: Multiple Agents Affected");
console.log("-".repeat(70));

const actor3 = { agentId: "agent-A", ttvBaseline: 100 };
const others3 = [
  { agentId: "agent-B", ttvBaseline: 150 },
  { agentId: "agent-C", ttvBaseline: 200 },
];
const projectedTTV3: Record<string, number> = {
  "agent-B": 155, // Increase by 5ms
  "agent-C": 205, // Increase by 5ms
};

const result3 = evaluateNonInterference(actor3, others3, projectedTTV3);

console.log("Input:");
console.log(
  `  Actor: ${actor3.agentId} (baseline TTV: ${actor3.ttvBaseline}ms)`,
);
console.log(`  Other agents:`);
others3.forEach((a) =>
  console.log(
    `    - ${a.agentId}: baseline=${a.ttvBaseline}ms, projected=${projectedTTV3[a.agentId]}ms`,
  ),
);
console.log();
console.log("Result:");
console.log(`  ❌ Allowed: ${result3.allowed}`);
console.log(`  Reason: ${result3.reason}`);
console.log();

console.log("=".repeat(70));
console.log("KEY INSIGHTS:");
console.log("=".repeat(70));
console.log("✅ Deterministic: Same inputs always produce same results");
console.log("✅ Pre-execution: Check happens BEFORE action is taken");
console.log("✅ Auditable: Clear rationale with violatedAgent and deltaTTV");
console.log("✅ Multi-agent safe: No agent can improve at expense of others");
console.log();
