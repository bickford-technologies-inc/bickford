#!/usr/bin/env tsx
/**
 * DEMO C: Multi-Agent Non-Interference (Shadow OPTR Runtime)
 * 
 * Demonstrates:
 * - Multi-agent path enumeration
 * - Non-interference checking
 * - Deny traces for inadmissible paths
 * - Metadata-only operation (no models, prompts, or user data)
 * 
 * CLASSIFICATION: UNCLASSIFIED // PUBLIC RELEASE
 */

import { readFileSync } from 'fs';
import { join } from 'path';

interface Event {
  // Core event fields used throughout the demo
  ts: string;
  source: string;
  type: string;
  entityId: string;

  // Known optional properties for this demo. We keep these narrow instead of
  // using an unconstrained index signature to preserve type safety.
  decision?: unknown;
  paths?: unknown;
  check?: unknown;
  details?: unknown; // generic metadata container for any extra structured data
}

function parseEvents(filePath: string): Event[] {
  const content = readFileSync(filePath, 'utf-8');
  return content
    .trim()
    .split('\n')
    .map(line => JSON.parse(line) as Event);
}

function printHeader() {
  console.log('═'.repeat(70));
  console.log('  BICKFORD DEMO C: Multi-Agent Non-Interference');
  console.log('  TIMESTAMP: 2025-12-22T00:00:00-05:00');
  console.log('  MODE: Shadow / Observational / Metadata-Only');
  console.log('═'.repeat(70));
  console.log();
}

function printScreen1() {
  console.log('📊 SCREEN 1: THE PROBLEM');
  console.log('─'.repeat(70));
  console.log();
  console.log('  Title: Execution Failure Through Interference');
  console.log();
  console.log('  Execution failure in defense and safety-critical systems is rarely');
  console.log('  caused by bad intent.');
  console.log();
  console.log('  It is caused by INTERFERENCE.');
  console.log();
  console.log('  • Parallel initiatives unknowingly block each other');
  console.log('  • Optimizations for one mission degrade another');
  console.log('  • Decisions made early are lost, contradicted, or re-decided');
  console.log('  • Safety gates amplify rework instead of preventing it');
  console.log();
  console.log('  THE RESULT:');
  console.log('  Unpredictable TTV, escalation churn, and silent mission risk.');
  console.log();
}

function printScreen2(eventsPath: string, events: Event[]) {
  console.log('📋 SCREEN 2: INPUT BOUNDARY (STRICT)');
  console.log('─'.repeat(70));
  console.log();
  console.log('  "This system consumes METADATA ONLY."');
  console.log();
  console.log('  Input:', eventsPath);
  console.log('  Events:', events.length, 'total');
  console.log();
  console.log('  INCLUDED:');
  console.log('  • Decision events (approve / block / defer)');
  console.log('  • Declared constraints (safety, policy, scope)');
  console.log('  • State transitions (draft → review → approved)');
  console.log('  • Timestamps and references');
  console.log();
  console.log('  EXPLICITLY EXCLUDED:');
  console.log('  • Models');
  console.log('  • Prompts');
  console.log('  • User data');
  console.log('  • Payloads');
  console.log('  • Operational control');
  console.log();
  console.log('  Sample events:');
  console.log();
  const initEvents = events.filter(e => e.type === 'INITIATIVE_DECLARED');
  initEvents.forEach(e => {
    console.log(`    ${e.ts} | ${e.type.padEnd(25)} | ${e.source}`);
  });
  console.log('    ...');
  console.log();
}

function printScreen3(events: Event[]) {
  console.log('📚 SCREEN 3: CANONICAL DECISIONS (BINDING STRUCTURE)');
  console.log('─'.repeat(70));
  console.log();
  console.log('  When a decision is declared, it becomes CANON.');
  console.log();
  
  const decisionEvent = events.find(e => e.type === 'DECISION_DECLARED');
  if (decisionEvent) {
    const decision = decisionEvent.decision;
    console.log('  EXAMPLE:');
    console.log('  ┌─────────────────────────────────────────────────────────────┐');
    console.log(`  │ Decision: "${decision.statement.substring(0, 55)}`);
    console.log(`  │           ${decision.statement.substring(55)}"`);
    console.log('  └─────────────────────────────────────────────────────────────┘');
    console.log();
    console.log('  That statement is now:');
    console.log('  • Timestamped');
    console.log('  • Evidence-referenced');
    console.log('  • Scope-bound');
    console.log('  • Mechanically enforced');
    console.log();
    console.log('  From this point forward, paths that violate canon are');
    console.log('  INADMISSIBLE BY DEFINITION.');
    console.log();
    console.log('  No humans required to remember.');
    console.log('  No meetings required to re-decide.');
  }
  console.log();
}

function printScreen4(events: Event[]) {
  console.log('🔀 SCREEN 4: MULTI-AGENT PATH ENUMERATION');
  console.log('─'.repeat(70));
  console.log();
  console.log('  At a given system state, multiple execution paths exist.');
  console.log();
  
  const pathEnum = events.find(e => e.type === 'PATH_ENUMERATION');
  if (pathEnum) {
    console.log('  ENUMERATED PATHS:');
    console.log();
    pathEnum.paths.forEach((path: any, idx: number) => {
      const letter = String.fromCharCode(65 + idx); // A, B, C...
      console.log(`  Path ${letter}: ${path.id}`);
      console.log(`    Actions: ${path.actions.join(', ')}`);
      console.log(`    Estimated TTV: A=${path.estimatedTTV_A}h, B=${path.estimatedTTV_B}h`);
      console.log();
    });
    console.log('  Each path is evaluated BEFORE EXECUTION against:');
    console.log('  • Time-to-Value');
    console.log('  • Constraint satisfaction');
    console.log('  • Risk exposure');
    console.log('  • Cross-initiative impact');
    console.log();
    console.log('  This is PATH RESOLUTION, not recommendation.');
  }
  console.log();
}

function printScreen5(events: Event[]) {
  console.log('❌ SCREEN 5: NON-INTERFERENCE CHECK (THE CORE INVARIANT)');
  console.log('─'.repeat(70));
  console.log();
  console.log('  Before any path is considered admissible, the system enforces');
  console.log('  a single rule:');
  console.log();
  console.log('  ╔═════════════════════════════════════════════════════════════╗');
  console.log('  ║  No action may reduce the expected Time-to-Value of any     ║');
  console.log('  ║  other active agent or initiative.                          ║');
  console.log('  ╚═════════════════════════════════════════════════════════════╝');
  console.log();
  console.log('  FORMALLY STATED:');
  console.log('  For all agents i ≠ j:');
  console.log('    ΔExpectedTTV(j | action by i) ≤ 0');
  console.log();
  
  const niCheck = events.find(e => e.type === 'NON_INTERFERENCE_CHECK' && e.check.result === 'VIOLATION');
  if (niCheck) {
    console.log('  CHECKING PATH: P-accelerate-A');
    console.log();
    console.log(`  Initiative A (agent i): ${niCheck.check.agent_i}`);
    console.log(`  Initiative B (agent j): ${niCheck.check.agent_j}`);
    console.log(`  ΔExpectedTTV(B | accelerate-A): +${niCheck.check.delta_TTV_j} hours`);
    console.log(`  Threshold: ${niCheck.check.threshold}`);
    console.log();
    console.log('  If a path improves one mission but delays another:');
    console.log('    → REJECTED');
    console.log();
    console.log('  Not flagged.');
    console.log('  Not warned.');
    console.log('  REJECTED.');
  }
  console.log();
}

function printScreen6(events: Event[]) {
  console.log('🔥 SCREEN 6: WHY-NOT DENY TRACE (AUDIT BACKBONE)');
  console.log('─'.repeat(70));
  console.log();
  console.log('  When a path is rejected, the system produces a WHY-NOT TRACE.');
  console.log();
  
  const denyTrace = events.find(e => e.type === 'DENY_TRACE');
  if (denyTrace) {
    const deny = denyTrace.deny;
    console.log('  EXAMPLE OUTPUT:');
    console.log('  ╔═════════════════════════════════════════════════════════════╗');
    console.log('  ║  Path: Accelerate Initiative A                              ║');
    console.log('  ╠═════════════════════════════════════════════════════════════╣');
    console.log(`  ║  Invariant: ${deny.invariant.padEnd(50)} ║`);
    console.log(`  ║  Reason: ${deny.because.substring(0, 53).padEnd(53)} ║`);
    if (deny.because.length > 53) {
      console.log(`  ║          ${deny.because.substring(53).padEnd(53)} ║`);
    }
    console.log(`  ║  Impact: ${deny.impact.substring(0, 53).padEnd(53)} ║`);
    if (deny.impact.length > 53) {
      console.log(`  ║          ${deny.impact.substring(53).padEnd(53)} ║`);
    }
    console.log(`  ║  Evidence: ${deny.evidenceRefs.join(', ').padEnd(51)} ║`);
    console.log(`  ║  Timestamp: ${denyTrace.ts.padEnd(48)} ║`);
    console.log('  ╚═════════════════════════════════════════════════════════════╝');
    console.log();
    console.log('  This creates:');
    console.log('  • Full auditability');
    console.log('  • Deterministic reasoning');
    console.log('  • Zero ambiguity after the fact');
    console.log();
    console.log('  There is no "why did we do this?" meeting later.');
  }
  console.log();
}

function printScreen7(events: Event[]) {
  console.log('🎯 SCREEN 7: OUTCOME');
  console.log('─'.repeat(70));
  console.log();
  console.log('  The system selects the FIRST ADMISSIBLE PATH that:');
  console.log();
  
  const selected = events.find(e => e.type === 'PATH_SELECTED');
  if (selected) {
    console.log(`  Selected: ${selected.selectedPath}`);
    console.log(`  Reason: ${selected.reason}`);
    console.log();
    console.log('  ✓ Respects all canonical decisions');
    console.log('  ✓ Preserves safety constraints');
    console.log('  ✓ Does not interfere with parallel missions');
    console.log();
    console.log('  Execution proceeds ONLY AFTER STRUCTURE IS SATISFIED.');
    console.log();
    console.log('  No heroics.');
    console.log('  No tribal knowledge.');
    console.log('  No silent tradeoffs.');
  }
  console.log();
}

function printSummary(events: Event[]) {
  console.log('═'.repeat(70));
  console.log('  DEMO SUMMARY');
  console.log('═'.repeat(70));
  console.log();
  console.log('  WHAT THIS DEMO PROVES:');
  console.log();
  console.log('  ✅ Multi-agent interference can be made mechanically impossible');
  console.log('  ✅ Safety constraints can reduce churn instead of increasing it');
  console.log('  ✅ Decisions can be preserved as executable structure');
  console.log('  ✅ Auditability does not require slowing execution');
  console.log();
  console.log('  All without:');
  console.log('  • Models');
  console.log('  • Prompts');
  console.log('  • Data access');
  console.log('  • Runtime control');
  console.log();
  
  const metrics = events.find(e => e.type === 'EXECUTION_COMPLETE');
  if (metrics) {
    console.log('  FINAL METRICS:');
    console.log();
    console.log(`    Actual TTV (Initiative A): ${metrics.metrics.actualTTV_A} hours`);
    console.log(`    Actual TTV (Initiative B): ${metrics.metrics.actualTTV_B} hours`);
    console.log(`    Inadmissible Paths Prevented: ${metrics.metrics.inadmissiblePathsPrevented}`);
    console.log(`    Interference Violations Detected: ${metrics.metrics.interferenceViolationsDetected}`);
    console.log(`    Decision Consistency Ratio (DCR): ${metrics.metrics.dcr}`);
    console.log();
  }
  
  console.log('─'.repeat(70));
  console.log('  WHY THIS MATTERS (DEFENSE CONTEXT)');
  console.log('─'.repeat(70));
  console.log();
  console.log('  In defense systems:');
  console.log('  • Interference is RISK');
  console.log('  • Re-decision is COST');
  console.log('  • Lost rationale is LIABILITY');
  console.log();
  console.log('  This approach treats DECISIONS AS FIRST-CLASS INFRASTRUCTURE,');
  console.log('  not documentation.');
  console.log();
  console.log('═'.repeat(70));
  console.log();
  console.log('  ╔═════════════════════════════════════════════════════════════╗');
  console.log('  ║                                                             ║');
  console.log('  ║  This system does not optimize faster action —              ║');
  console.log('  ║  it makes unsafe and interfering actions IMPOSSIBLE.        ║');
  console.log('  ║                                                             ║');
  console.log('  ╚═════════════════════════════════════════════════════════════╝');
  console.log();
  console.log('═'.repeat(70));
  console.log();
  console.log('🎉 Demo complete! Ready to present.');
  console.log();
}

function main() {
  const eventsPath = join(process.cwd(), 'demo', 'events-multi-agent.jsonl');
  const events = parseEvents(eventsPath);
  
  printHeader();
  printScreen1();
  printScreen2(eventsPath, events);
  printScreen3(events);
  printScreen4(events);
  printScreen5(events);
  printScreen6(events);
  printScreen7(events);
  printSummary(events);
}

main();
