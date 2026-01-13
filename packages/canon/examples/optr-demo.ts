#!/usr/bin/env node
/**
 * Bickford OPTR Demo
 * Demonstrates decision optimization with promotion gates and non-interference
 */

import {
  optrResolve,
  requireCanonRefs,
  promotionGate,
  gateNonInterference,
  DEFAULT_WEIGHTS,
  type Action,
  type CandidatePath,
  type CanonLevel,
  DenialReasonCode,
} from "../src/canon";

// Setup: Create canonical knowledge store
const canonStore = new Map<string, { level: CanonLevel }>([
  ["CANON_001", { level: "CANON" }],
  ["CANON_002", { level: "CANON" }],
  ["CANON_042", { level: "CANON" }],
]);

// Define actions
const action1: Action = {
  id: "action_deploy_feature",
  name: "Deploy new feature",
  description: "Deploy feature X to production",
  prerequisitesCanonIds: ["CANON_001"], // Requires approval
  riskLevel: "MEDIUM",
  resourcesUsed: ["production_db", "cache_layer"],
  sharedStateModified: ["user_settings"],
};

const action2: Action = {
  id: "action_rollback",
  name: "Rollback deployment",
  description: "Revert to previous version",
  prerequisitesCanonIds: ["CANON_001", "CANON_002"], // Requires incident + approval
  riskLevel: "LOW",
  resourcesUsed: ["production_db"],
  sharedStateModified: ["user_settings"],
};

const action3: Action = {
  id: "action_scale_up",
  name: "Scale infrastructure",
  description: "Add capacity",
  prerequisitesCanonIds: [], // No prerequisites - WILL FAIL authority gate
  riskLevel: "HIGH",
  resourcesUsed: ["compute_cluster"],
  sharedStateModified: [],
};

// Define candidate paths
const candidates: CandidatePath[] = [
  {
    id: "path_deploy",
    actions: [action1],
  },
  {
    id: "path_rollback",
    actions: [action2],
  },
  {
    id: "path_scale",
    actions: [action3],
  },
];

// Feature function (extracts TTV, cost, risk from path)
function extractFeatures(path: CandidatePath) {
  const action = path.actions[0];
  
  // Simplified TTV estimation
  const ttvMap: Record<string, number> = {
    action_deploy_feature: 300000, // 5 minutes
    action_rollback: 120000,       // 2 minutes
    action_scale_up: 600000,       // 10 minutes
  };
  
  const costMap: Record<string, number> = {
    action_deploy_feature: 50,
    action_rollback: 10,
    action_scale_up: 200,
  };
  
  const riskMap: Record<string, number> = {
    LOW: 0.1,
    MEDIUM: 0.3,
    HIGH: 0.7,
  };
  
  return {
    ttv: ttvMap[action.id] || 300000,
    cost: costMap[action.id] || 50,
    risk: riskMap[action.riskLevel] || 0.3,
    successProb: 0.9,
    nextAction: action,
  };
}

// Run OPTR
console.log("\n🎯 BICKFORD OPTR DEMO\n");
console.log("=" .repeat(60));
console.log("\nCanonical Knowledge Store:");
console.log(`  - ${canonStore.size} CANON-level items`);
console.log(`  - IDs: ${Array.from(canonStore.keys()).join(", ")}`);

console.log("\n\nCandidate Paths:");
for (const path of candidates) {
  const action = path.actions[0];
  console.log(`\n  ${path.id}:`);
  console.log(`    Action: ${action.name}`);
  console.log(`    Risk: ${action.riskLevel}`);
  console.log(`    Prerequisites: ${action.prerequisitesCanonIds.join(", ") || "none"}`);
}

console.log("\n\n" + "=".repeat(60));
console.log("RUNNING OPTR DECISION ENGINE\n");

const run = optrResolve({
  ts: new Date().toISOString(),
  tenantId: "tenant_demo",
  goal: "Optimize deployment decision",
  candidates,
  canonRefsUsed: ["CANON_001", "CANON_042"],
  canonIdsPresent: Array.from(canonStore.keys()),
  canonStore,
  weights: DEFAULT_WEIGHTS,
  bounds: { maxRisk: 0.5, maxCost: 150 },
  featureFn: extractFeatures,
});

// Display results
console.log("Results:\n");

for (const candidate of run.candidates) {
  const action = candidate.features!.nextAction;
  console.log(`\n${candidate.id}:`);
  console.log(`  Score: ${candidate.score?.total.toFixed(2)}`);
  console.log(`  Components:`);
  console.log(`    - TTV: ${candidate.score?.ttv.toFixed(0)}ms`);
  console.log(`    - Cost: $${candidate.score?.cost.toFixed(2)}`);
  console.log(`    - Risk: ${candidate.score?.risk.toFixed(2)}`);
  console.log(`    - Success: ${(candidate.score?.successProb! * 100).toFixed(0)}%`);
  
  if (candidate.score?.total === Infinity) {
    console.log(`  ❌ INADMISSIBLE (denied by gates)`);
  } else if (candidate.id === run.selectedPathId) {
    console.log(`  ✅ SELECTED (optimal)`);
  }
}

// Display denials
if (run.denyTraces && run.denyTraces.length > 0) {
  console.log("\n\n" + "=".repeat(60));
  console.log("DENIAL TRACES (WhyNot)\n");
  
  for (const deny of run.denyTraces) {
    console.log(`\n❌ ${deny.actionId}:`);
    console.log(`  Reason Codes: ${deny.reasonCodes.join(", ")}`);
    console.log(`  Message: ${deny.message}`);
    
    if (deny.missingCanonIds) {
      console.log(`  Missing Canon: ${deny.missingCanonIds.join(", ")}`);
    }
  }
}

console.log("\n\n" + "=".repeat(60));
console.log(`SELECTED ACTION: ${run.selectedNextActionId}\n`);

// Demonstrate promotion gate
console.log("\n" + "=".repeat(60));
console.log("PROMOTION GATE DEMO\n");

const promotionTests = {
  resistance: true,
  reproducible: true,
  invariantSafe: true,
  feasibilityImpact: true,
  evidenceRefs: ["EXP_001", "OBS_002"],
};

const decision = promotionGate({
  ts: new Date().toISOString(),
  itemId: "NEW_EVIDENCE_001",
  from: "EVIDENCE",
  tests: promotionTests,
});

console.log(`Promotion Decision for ${decision.itemId}:`);
console.log(`  From: ${decision.from} → To: ${decision.to}`);
console.log(`  Approved: ${decision.approved ? "✅ YES" : "❌ NO"}`);
console.log(`  Reason: ${decision.reason}`);
console.log("\n  Tests:");
console.log(`    - Resistance: ${promotionTests.resistance ? "✅" : "❌"}`);
console.log(`    - Reproducibility: ${promotionTests.reproducible ? "✅" : "❌"}`);
console.log(`    - Invariant Safety: ${promotionTests.invariantSafe ? "✅" : "❌"}`);
console.log(`    - Feasibility Impact: ${promotionTests.feasibilityImpact ? "✅" : "❌"}`);

// Demonstrate non-interference
console.log("\n\n" + "=".repeat(60));
console.log("NON-INTERFERENCE CHECK DEMO\n");

const deltaExpectedTTV = {
  agent_1: 0,      // No impact
  agent_2: 150,    // +150ms (VIOLATION)
  agent_3: -50,    // Improvement (OK)
};

const niCheck = gateNonInterference(
  action1,
  "agent_0",
  deltaExpectedTTV,
  new Date().toISOString()
);

if (niCheck) {
  console.log(`❌ Non-interference violation detected:`);
  console.log(`  Action: ${niCheck.actionId}`);
  console.log(`  Reason: ${niCheck.reasonCodes.join(", ")}`);
  console.log(`  Message: ${niCheck.message}`);
  if (niCheck.context) {
    console.log(`  Violations:`, JSON.stringify(niCheck.context.violations, null, 2));
  }
} else {
  console.log(`✅ Non-interference check passed`);
}

console.log("\n" + "=".repeat(60));
console.log("\nDemo complete! 🎉\n");
