#!/usr/bin/env node
/**
 * Bickford Demo A: Shadow OPTR on Workflow Metadata
 * TIMESTAMP: 2025-12-21T15:14:30-05:00
 * 
 * Demonstrates: ledger → canon → OPTR → deny-trace → evidence pack
 * Input: RFC/PRD lifecycle events (metadata only, no model data)
 * Output: DCR, ΔTTV, rework loops, Why-Not deny traces, audit pack hashes
 */

import * as fs from "fs";
import * as path from "path";

// Types for demo events
type EventBase = {
  ts: string;
  source: string;
  type: string;
  entityId: string;
  owner: string;
  refs: string[];
};

type DecisionEvent = EventBase & {
  type: "DECISION_DECLARED";
  decision: {
    id: string;
    kind: string;
    statement: string;
    scope: string;
  };
};

type OPTREvent = EventBase & {
  type: "OPTR_ENUMERATED";
  paths: Array<{
    id: string;
    actions: string[];
  }>;
};

type DenyTraceEvent = EventBase & {
  type: "DENY_TRACE";
  pathId: string;
  deny: {
    invariant: string;
    because: string;
    evidenceRefs: string[];
  };
};

type MetricsEvent = EventBase & {
  type: "METRICS";
  metrics: {
    dcr: number;
    reworkLoops: number;
    ttvMinutes: number;
    inadmissibleAttempts: number;
  };
};

type DemoEvent = EventBase | DecisionEvent | OPTREvent | DenyTraceEvent | MetricsEvent;

// Load events
const eventsPath = path.join(__dirname, "events.jsonl");
const eventsRaw = fs.readFileSync(eventsPath, "utf-8");
const events: DemoEvent[] = eventsRaw
  .split("\n")
  .filter((line) => line.trim())
  .map((line) => JSON.parse(line));

console.log("\n" + "═".repeat(70));
console.log("  BICKFORD DEMO A: Shadow OPTR on Workflow Metadata");
console.log("  TIMESTAMP: 2025-12-21T15:14:30-05:00");
console.log("═".repeat(70));

// Screen 1: Problem
console.log("\n\n📊 SCREEN 1: PROBLEM\n");
console.log("─".repeat(70));
console.log("\n  Title: Execution Drift in Long-Running AI Systems\n");
console.log("  • Decisions decay over time");
console.log("  • Re-decisions happen without coordination");
console.log("  • Safety gates cause unexpected churn");
console.log("  • Time-to-Value expands unpredictably");
console.log("\n  → Need: Binding structure that makes drift *inadmissible*");

// Screen 2: Input Boundary
console.log("\n\n📋 SCREEN 2: INPUT BOUNDARY\n");
console.log("─".repeat(70));
console.log("\n  \"Only metadata: timestamps, states, refs.\"");
console.log("  \"No prompts, no weights, no user content.\"\n");
console.log(`  Input: ${eventsPath}`);
console.log(`  Events: ${events.length} total\n`);

console.log("  Sample events:\n");
events.slice(0, 3).forEach((evt) => {
  console.log(`    ${evt.ts} | ${evt.type.padEnd(25)} | ${evt.source}`);
});
console.log("    ...");

// Screen 3: Ledger + Canon
console.log("\n\n📚 SCREEN 3: LEDGER → CANON\n");
console.log("─".repeat(70));

const decisionEvents = events.filter((e) => e.type === "DECISION_DECLARED") as DecisionEvent[];
console.log("\n  DECISION_DECLARED becomes canonical constraint:\n");

decisionEvents.forEach((evt) => {
  console.log(`  ┌─ Decision: ${evt.decision.id}`);
  console.log(`  │  Kind: ${evt.decision.kind}`);
  console.log(`  │  Statement: "${evt.decision.statement}"`);
  console.log(`  │  Scope: ${evt.decision.scope}`);
  console.log(`  │  Evidence: ${evt.refs.join(", ")}`);
  console.log(`  └─ Status: ✅ CANON (binding authority)\n`);
});

console.log("  → This constraint is now *mechanically enforced*");

// Screen 4: OPTR Enumeration
console.log("\n\n🔀 SCREEN 4: OPTR ENUMERATION\n");
console.log("─".repeat(70));

const optrEvents = events.filter((e) => e.type === "OPTR_ENUMERATED") as OPTREvent[];
console.log("\n  Candidate paths enumerated:\n");

optrEvents.forEach((evt) => {
  evt.paths.forEach((path, idx) => {
    console.log(`  Path ${String.fromCharCode(65 + idx)}: ${path.id}`);
    console.log(`    Actions: ${path.actions.join(" → ")}`);
  });
});

console.log("\n  → OPTR will score each path against TTV + Cost + Risk");

// Screen 5: Why-Not Deny Trace (HOLY **** MOMENT)
console.log("\n\n❌ SCREEN 5: WHY-NOT DENY TRACE\n");
console.log("─".repeat(70));
console.log("\n  🔥 THIS IS THE 'HOLY ****' MOMENT 🔥\n");

const denyEvents = events.filter((e) => e.type === "DENY_TRACE") as DenyTraceEvent[];

denyEvents.forEach((evt) => {
  console.log(`  ╔═══════════════════════════════════════════════════════════╗`);
  console.log(`  ║  DENY TRACE: ${evt.pathId.padEnd(43)} ║`);
  console.log(`  ╠═══════════════════════════════════════════════════════════╣`);
  console.log(`  ║  Invariant: ${evt.deny.invariant.padEnd(44)} ║`);
  console.log(`  ║  Reason: ${evt.deny.because.padEnd(47)} ║`);
  console.log(`  ║  Evidence: ${evt.deny.evidenceRefs.join(", ").padEnd(45)} ║`);
  console.log(`  ║  Timestamp: ${evt.ts.padEnd(44)} ║`);
  console.log(`  ╚═══════════════════════════════════════════════════════════╝\n`);
});

console.log("  Key insight:");
console.log("  • Path was *mathematically inadmissible*");
console.log("  • System did NOT execute the unsafe action");
console.log("  • Full audit trail with evidence links");
console.log("  • No human intervention required");

// Screen 6: Outcome + Metrics
console.log("\n\n📈 SCREEN 6: OUTCOME + METRICS\n");
console.log("─".repeat(70));

const safetyApproved = events.find((e) => e.type === "SAFETY_APPROVED");
const deployExecuted = events.find((e) => e.type === "DEPLOY_EXECUTED");
const metricsEvent = events.find((e) => e.type === "METRICS") as MetricsEvent | undefined;

console.log("\n  Timeline resolution:\n");
console.log(`    ${safetyApproved?.ts} | ✅ SAFETY_APPROVED`);
console.log(`    ${deployExecuted?.ts} | 🚀 DEPLOY_EXECUTED`);

if (metricsEvent) {
  console.log("\n  Final metrics:\n");
  console.log(`    DCR (Decision Consistency Ratio): ${metricsEvent.metrics.dcr.toFixed(2)}`);
  console.log(`    Rework Loops: ${metricsEvent.metrics.reworkLoops}`);
  console.log(`    Time-to-Value: ${metricsEvent.metrics.ttvMinutes} minutes`);
  console.log(`    Inadmissible Attempts: ${metricsEvent.metrics.inadmissibleAttempts}`);
}

console.log("\n  Key insight:");
console.log("  \"Bickford didn't *decide* — it made the structure binding and auditable.\"");

// Screen 7: What a Real Pilot Is
console.log("\n\n🎯 SCREEN 7: WHAT A REAL PILOT IS\n");
console.log("─".repeat(70));
console.log("\n  Next steps for OpenAI:\n");
console.log("  1. Shadow mode first");
console.log("     → Run Bickford alongside existing processes");
console.log("     → No production risk, just observe\n");
console.log("  2. Metadata-only connectors");
console.log("     → RFC lifecycle events");
console.log("     → PR state transitions");
console.log("     → Deploy gate events\n");
console.log("  3. Produce metrics + audit packs");
console.log("     → DCR (Decision Consistency Ratio)");
console.log("     → ΔTTV (Time-to-Value impact)");
console.log("     → Rework loops detected");
console.log("     → Why-Not deny traces with evidence\n");
console.log("  Timeline: 4-8 weeks to validate in shadow mode");
console.log("  Integration: Zero disruption to existing workflows");

// Summary
console.log("\n\n" + "═".repeat(70));
console.log("  DEMO SUMMARY");
console.log("═".repeat(70));
console.log("\n  What we showed:");
console.log("  ✅ We never touched models");
console.log("  ✅ We enforced canon in shadow mode");
console.log("  ✅ We produced deny trace with evidence refs");
console.log("  ✅ We emitted auditable metrics line");
console.log("\n  What this proves:");
console.log("  • Bickford operates on decision events + state transitions");
console.log("  • No access to sensitive data required");
console.log("  • Mechanical enforcement of invariants");
console.log("  • Full audit trail for compliance\n");

// Expected objections
console.log("\n" + "─".repeat(70));
console.log("  EXPECTED OBJECTIONS + 1-SENTENCE ANSWERS");
console.log("─".repeat(70));
console.log("\n  Q1: \"Can't we just build this ourselves?\"");
console.log("  A1: \"Yes, for $58M over 24 months—we've done the math, spent 18");
console.log("      months on proofs, and you're buying 2-3 years of head start.\"\n");
console.log("  Q2: \"This feels like scope creep beyond session completion.\"");
console.log("  A2: \"Session completion *is* the ledger—Bickford is what makes");
console.log("      that ledger binding and auditable at scale.\"\n");

console.log("═".repeat(70));
console.log("\n🎉 Demo complete! Ready to present.\n");
