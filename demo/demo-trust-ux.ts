#!/usr/bin/env tsx
/**
 * Bickford Demo: Phase 3 Trust UX - Denial Ledger & WhyNot
 * TIMESTAMP: 2026-01-12T21:35:00Z
 *
 * Demonstrates:
 * - Denial creation via gate functions
 * - Mechanical denial persistence
 * - WhyNot trace structure
 * - Replayable explanations
 *
 * This is a simplified demonstration that doesn't require a database.
 */

import type { DeniedDecisionPayload } from "../packages/types/src/index";
import {
  Action,
  DenialReasonCode,
  WhyNotTrace,
} from "../packages/types/src/canon";
import {
  gateSecondActionTooEarly,
  gateAuthorityBoundary,
  gateRiskBounds,
  gateCostBounds,
} from "../packages/canon/src/canon/optr";

console.log("\n" + "═".repeat(80));
console.log("  BICKFORD PHASE 3: Trust UX - Denial Ledger & WhyNot");
console.log("  Guarantees: No silent denials, replayable explanations");
console.log("═".repeat(80));

// --- Demo Setup ---
const nowIso = new Date().toISOString();
const tenantId = "demo-tenant";

// Define sample actions with prerequisites
const action1: Action = {
  id: "action-1",
  name: "Deploy to Production",
  description: "Deploy the application to production environment",
  prerequisitesCanonIds: ["canon-security-review", "canon-load-tests"],
  riskLevel: "HIGH",
  resourcesUsed: ["prod-cluster"],
};

const action2: Action = {
  id: "action-2",
  name: "Run Performance Tests",
  description: "Execute performance test suite",
  prerequisitesCanonIds: [],
  riskLevel: "LOW",
};

const action3: Action = {
  id: "action-3",
  name: "Expensive ML Training",
  description: "Train large language model on full dataset",
  prerequisitesCanonIds: [],
  riskLevel: "MEDIUM",
};

// --- Screen 1: Gate Functions Demo ---
console.log("\n\n🚪 SCREEN 1: Gate Functions (Denial Creation)\n");
console.log("─".repeat(80));

console.log(
  "\n1️⃣  Testing gateSecondActionTooEarly (missing prerequisites):\n",
);

const canonPresent = new Set(["canon-load-tests"]); // Missing security-review

const denial1 = gateSecondActionTooEarly(action1, canonPresent, nowIso);

if (denial1) {
  console.log("   ❌ DENIED!");
  console.log(`   Action: ${action1.name}`);
  console.log(`   Reason: ${denial1.reasonCodes.join(", ")}`);
  console.log(`   Message: ${denial1.message}`);
  console.log(`   Missing Canon: ${denial1.missingCanonIds?.join(", ")}`);
} else {
  console.log("   ✅ Approved");
}

console.log(
  "\n2️⃣  Testing gateAuthorityBoundary (missing canon references):\n",
);

const canonStore = new Map([
  ["canon-load-tests", { level: "CANON" }],
  ["canon-security-review", { level: "CANON" }],
]);

const denial2 = gateAuthorityBoundary(
  action1,
  ["canon-load-tests"], // Only one ref, missing security-review
  canonStore,
  nowIso,
);

if (denial2) {
  console.log("   ❌ DENIED!");
  console.log(`   Action: ${action1.name}`);
  console.log(`   Reason: ${denial2.reasonCodes.join(", ")}`);
  console.log(`   Message: ${denial2.message}`);
} else {
  console.log("   ✅ Approved");
}

console.log("\n3️⃣  Testing gateRiskBounds (risk exceeded):\n");

const features3 = {
  ttv: 100,
  cost: 50,
  risk: 0.9, // High risk!
  successProb: 0.7,
  nextAction: action1,
};

const denial3 = gateRiskBounds(features3, 0.5, nowIso);

if (denial3) {
  console.log("   ❌ DENIED!");
  console.log(`   Action: ${action1.name}`);
  console.log(`   Reason: ${denial3.reasonCodes.join(", ")}`);
  console.log(`   Message: ${denial3.message}`);
} else {
  console.log("   ✅ Approved");
}

console.log("\n4️⃣  Testing gateCostBounds (cost exceeded):\n");

const features4 = {
  ttv: 100,
  cost: 1500, // Very expensive!
  risk: 0.3,
  successProb: 0.9,
  nextAction: action3,
};

const denial4 = gateCostBounds(features4, 1000, nowIso);

if (denial4) {
  console.log("   ❌ DENIED!");
  console.log(`   Action: ${action3.name}`);
  console.log(`   Reason: ${denial4.reasonCodes.join(", ")}`);
  console.log(`   Message: ${denial4.message}`);
} else {
  console.log("   ✅ Approved");
}

// --- Screen 2: Structured Denial Payloads ---
console.log("\n\n📦 SCREEN 2: Structured Denial Payloads\n");
console.log("─".repeat(80));

console.log("\n   Denial payloads are structured for ledger persistence:\n");

const collectedDenials: WhyNotTrace[] = [
  denial1,
  denial2,
  denial3,
  denial4,
].filter((d): d is WhyNotTrace => d !== null);

collectedDenials.forEach((denial, idx) => {
  console.log(`\n   Denial #${idx + 1}:`);
  console.log(`     Timestamp: ${denial.ts}`);
  console.log(`     Action ID: ${denial.actionId}`);
  console.log(`     Reason Codes: ${denial.reasonCodes.join(", ")}`);
  console.log(`     Message: ${denial.message}`);
  if (denial.missingCanonIds && denial.missingCanonIds.length > 0) {
    console.log(`     Missing Canon: ${denial.missingCanonIds.join(", ")}`);
  }
  if (denial.context) {
    console.log(`     Context: ${JSON.stringify(denial.context, null, 2)}`);
  }
});

// --- Screen 3: DenialReasonCode Taxonomy ---
console.log("\n\n🏷️  SCREEN 3: Stable Denial Taxonomy\n");
console.log("─".repeat(80));

console.log("\n   All denial reasons use stable taxonomy:\n");

const reasonCodes = Object.keys(DenialReasonCode);
reasonCodes.forEach((code, idx) => {
  console.log(`     ${idx + 1}. ${code}`);
});

console.log("\n   This ensures:");
console.log("     ✓ Consistent denial categories");
console.log("     ✓ Machine-readable explanations");
console.log("     ✓ Queryable denial history");
console.log("     ✓ Pattern detection & analysis");

// --- Screen 4: Mock Persistence (conceptual) ---
console.log("\n\n💾 SCREEN 4: Denial Persistence (Conceptual)\n");
console.log("─".repeat(80));

console.log("\n   In production, each denial would be persisted via:");
console.log("     → mechanicalDeny(trace, tenantId, goal, action)");
console.log("     → persistDeniedDecision(payload)");
console.log("     → Prisma: deniedDecision.create(...)");
console.log("\n   For this demo (no database), showing payload structure:\n");

const examplePayload: DeniedDecisionPayload = {
  decisionId: "example-decision-id",
  actionId: action1.id,
  tenantId,
  denied: true,
  reason: "Denied: Missing prerequisite canon items",
  message: "Action denied due to missing canon items.",
  ts: new Date().toISOString(),
};

console.log("   Example Payload:");
console.log(JSON.stringify(examplePayload, null, 2));

// --- Screen 5: WhyNot API ---
console.log("\n\n🔍 SCREEN 5: WhyNot Explanations\n");
console.log("─".repeat(80));

console.log("\n   Users can query denied decisions via WhyNot API:");
console.log("\n     GET /api/why-not?actionId=action-1&tenantId=demo-tenant");
console.log("\n   Response would include:");
console.log("     • All denials for that action");
console.log("     • Timestamps and reason codes");
console.log("     • Missing prerequisites");
console.log("     • Full context for replay");

// --- Screen 6: Trust Guarantees ---
console.log("\n\n🔒 SCREEN 6: Trust Guarantees\n");
console.log("─".repeat(80));

console.log("\n   Phase 3 Trust UX provides mechanical guarantees:\n");
console.log("   ✓ No silent denials");
console.log("     → Every denial MUST flow through mechanicalDeny");
console.log("     → CI blocks non-persisted rejections\n");
console.log("   ✓ No unexplained rejection");
console.log("     → WhyNot API provides replayable explanations");
console.log("     → Stable taxonomy enables pattern analysis\n");
console.log("   ✓ Every denial is ledgered");
console.log("     → Prisma DeniedDecision model");
console.log("     → Queryable by action, tenant, reason code\n");
console.log("   ✓ CI blocks regression permanently");
console.log("     → check-trust-invariants.mjs validates structure");
console.log("     → GitHub Actions enforces on every PR\n");

// --- Summary ---
console.log("\n" + "═".repeat(80));
console.log("  ✅ PHASE 3 COMPLETE: Trust UX mechanically enforced");
console.log("  Total denials in demo: " + collectedDenials.length);
console.log(
  "  Reason codes used: " +
    new Set(collectedDenials.flatMap((d) => d.reasonCodes)).size,
);
console.log("═".repeat(80) + "\n");
