#!/usr/bin/env tsx
/**
 * Bickford Runtime Demo - Core Integration
 * TIMESTAMP: 2026-01-12T03:06:00Z
 * 
 * Demonstrates the full decision continuity runtime:
 * 1. Create runtime instance
 * 2. Submit execution intent
 * 3. OPTR evaluates candidates
 * 4. Canon enforces invariants
 * 5. Hash-linked ledger records result
 */

import {
  BickfordRuntime,
  ExecutionIntent,
  Action,
  CandidatePath,
  INVARIANTS
} from "../src/index";

console.log("=== Bickford Runtime Demo ===\n");

// Step 1: Create runtime
console.log("Step 1: Initialize runtime");
const runtime = new BickfordRuntime({
  weights: {
    lambdaC: 1.0,  // Cost coefficient
    lambdaR: 2.0,  // Risk coefficient
    lambdaP: 0.5   // Success probability coefficient
  }
});
console.log("✓ Runtime initialized\n");

// Step 2: Define candidate actions
console.log("Step 2: Define candidate paths");
const deployAction: Action = {
  id: "action_deploy_feature",
  name: "Deploy Feature",
  description: "Deploy new feature to production",
  prerequisitesCanonIds: ["INV_CANON_ONLY_EXECUTION"], // References a canon invariant
  riskLevel: "MEDIUM"
};

const testAction: Action = {
  id: "action_run_tests",
  name: "Run Tests",
  description: "Execute test suite",
  prerequisitesCanonIds: [],
  riskLevel: "LOW"
};

const path1: CandidatePath = {
  id: "path_1",
  actions: [testAction, deployAction]
};

const path2: CandidatePath = {
  id: "path_2",
  actions: [deployAction] // Risky: deploy without testing
};

console.log(`✓ Defined ${2} candidate paths\n`);

// Step 3: Create execution intent
console.log("Step 3: Create execution intent");
const intent: ExecutionIntent = {
  goal: "Deploy feature safely",
  tenantId: "tenant_demo",
  actor: "user_alice",
  candidatePaths: [path1, path2],
  canonRefsUsed: ["INV_CANON_ONLY_EXECUTION", "INV_TS_MANDATORY"]
};
console.log(`✓ Intent: "${intent.goal}"\n`);

// Step 4: Execute through runtime
console.log("Step 4: Execute through Canon framework");
const result = runtime.execute(intent);

console.log("\n=== Execution Result ===");
console.log(`Allowed: ${result.allowed}`);

if (result.allowed && result.selectedAction) {
  console.log(`Selected Action: ${result.selectedAction.name}`);
  console.log(`Description: ${result.selectedAction.description}`);
  console.log(`Risk Level: ${result.selectedAction.riskLevel}`);
} else if (result.denyTraces) {
  console.log(`Denied: ${result.denyTraces.length} gate(s) failed`);
  for (const trace of result.denyTraces) {
    console.log(`  - ${trace.message}`);
  }
}

console.log("\n=== Ledger Entry ===");
console.log(`Hash: ${result.ledgerEntry.hash}`);
console.log(`Previous Hash: ${result.ledgerEntry.previousHash}`);
console.log(`Index: ${result.ledgerEntry.index}`);
console.log(`Timestamp: ${result.ledgerEntry.timestamp}`);

// Step 5: Verify ledger integrity
console.log("\n=== Ledger Verification ===");
const isValid = runtime.verifyLedger();
console.log(`Ledger integrity: ${isValid ? "✓ VALID" : "✗ INVALID"}`);
console.log(`Total entries: ${runtime.getLedgerSize()}`);

// Step 6: Display all ledger entries
console.log("\n=== Full Ledger ===");
const ledger = runtime.getLedger();
for (const entry of ledger) {
  console.log(`[${entry.index}] ${entry.event.kind} - ${entry.hash.slice(0, 16)}...`);
  console.log(`  Actor: ${entry.event.actor}`);
  console.log(`  Tenant: ${entry.event.tenantId}`);
  console.log(`  Previous: ${entry.previousHash.slice(0, 16)}...`);
}

console.log("\n=== Demo Complete ===");
console.log("Core features demonstrated:");
console.log("✓ Hash-linked append-only ledger");
console.log("✓ Explicit execution intent");
console.log("✓ Canon-based authorization");
console.log("✓ OPTR decision making");
console.log("✓ Deterministic behavior");
console.log("✓ No hidden state");
