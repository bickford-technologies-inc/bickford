/**
 * Tests for Tier-1 and Tier-2 Closures
 * TIMESTAMP: 2026-01-12T20:50:00-05:00
 */

import {
  // Execution functions
  createExecutionContext,
  bufferTokensWithProof,
  verifyTokenStreamProof,
  sealChatItem,
  finalizeChatItem,

  // OPTR functions
  ingestCanonAsConstraints,
  applyPathConstraints,

  // Types
  Action,
  CandidatePath,
} from "../packages/bickford/src/canon";

import {
  formatWhyNotPanel,
  createDeniedDecisionProof,
  verifyDeniedDecisionProof,
} from "../packages/bickford/api/whynot-panel";

import { DenialReasonCode } from "../packages/bickford/src/canon/types";
import { _resetLedger } from "../packages/bickford/src/canon";

console.log("\n" + "═".repeat(80));
console.log("  TIER-1 AND TIER-2 CLOSURES - TESTS");
console.log("═".repeat(80) + "\n");

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.log(`  ✗ ${message}`);
    failed++;
  }
}

// Test 1: Execution Context Hash is Deterministic
_resetLedger();
console.log("\nTest 1: Execution Context Hash is Deterministic");
console.log("─".repeat(80));

const context1 = createExecutionContext({
  executionId: "exec_001",
  timestamp: "2026-01-12T20:00:00.000Z",
  tenantId: "tenant_001",
  actorId: "actor_001",
  canonRefsSnapshot: ["CANON_A", "CANON_B"],
  constraintsSnapshot: ["CONSTRAINT_X"],
  environment: { version: "1.0.0" },
});

const context2 = createExecutionContext({
  executionId: "exec_001",
  timestamp: "2026-01-12T20:00:00.000Z",
  tenantId: "tenant_001",
  actorId: "actor_001",
  canonRefsSnapshot: ["CANON_A", "CANON_B"],
  constraintsSnapshot: ["CONSTRAINT_X"],
  environment: { version: "1.0.0" },
});

assert(
  context1.contextHash === context2.contextHash,
  "Same inputs produce same context hash",
);
assert(
  context1.contextHash.length === 64,
  "Context hash is SHA256 (64 hex chars)",
);

// Test 2: Token Stream Proof Verification
_resetLedger();
console.log("\nTest 2: Token Stream Proof Verification");
console.log("─".repeat(80));

const tokens = ["Hello", " world"];
const ledgerState = { seq: 1, hash: "test_hash" };

const proof = bufferTokensWithProof({
  executionId: "exec_001",
  streamId: "stream_001",
  tokens,
  ledgerState,
  authCheck: (t, s) => s.seq > 0,
  timestamp: "2026-01-12T20:00:00.000Z",
});

assert(proof.approved, "Tokens approved when auth check passes");
assert(proof.tokens.length === 2, "All tokens buffered");
assert(proof.proofHash.length === 64, "Proof hash is SHA256");

const verification = verifyTokenStreamProof(proof, ledgerState);
assert(verification.valid, "Proof verifies with correct ledger state");

const wrongState = { seq: 2, hash: "wrong_hash" };
const wrongVerification = verifyTokenStreamProof(proof, wrongState);
assert(!wrongVerification.valid, "Proof fails with wrong ledger state");

// Test 3: Chat Item Seal and Finalize
_resetLedger();
console.log("\nTest 3: Chat Item Seal and Finalize");
console.log("─".repeat(80));

const timestamp = "2026-01-12T20:00:00.000Z";
const sealed = sealChatItem({ itemId: "msg_001", timestamp });

assert(sealed.sealedAt instanceof Date, "Seal produces Date object");
assert(sealed.hash.length === 64, "Seal hash is SHA256");

const finalized = finalizeChatItem({
  itemId: "msg_001",
  sealedAt: sealed.sealedAt,
  timestamp: "2026-01-12T20:00:01.000Z",
  canonRefs: ["CANON_A"],
});

assert(finalized.finalized, "Finalization succeeds with canon refs");
assert(finalized.hash.length === 64, "Finalization hash is SHA256");

// Test 4: WhyNot Panel Formatting
_resetLedger();
console.log("\nTest 4: WhyNot Panel Formatting");
console.log("─".repeat(80));

const denyTrace = {
  ts: timestamp,
  actionId: "action_001",
  denied: true as const,
  reasonCodes: [DenialReasonCode.MISSING_CANON_PREREQS],
  missingCanonIds: ["CANON_MISSING"],
  requiredCanonRefs: ["CANON_A", "CANON_MISSING"],
  message: "Test denial",
  context: { test: true },
};

const panelData = formatWhyNotPanel(denyTrace);
assert(panelData.title === "Action Denied", "Panel has correct title");
assert(panelData.denialReasons.length === 1, "Panel includes denial reasons");
assert(
  panelData.missingPrerequisites.length === 1,
  "Panel includes missing prereqs",
);
assert(panelData.proofHash.length === 64, "Panel includes proof hash");

// Test 5: Denied Decision Proof
_resetLedger();
console.log("\nTest 5: Denied Decision Proof");
console.log("─".repeat(80));

const proof2 = createDeniedDecisionProof(denyTrace);
assert(proof2.id.startsWith("deny_"), "Proof has correct ID format");
assert(proof2.actionId === "action_001", "Proof includes action ID");
assert(proof2.proofHash.length === 64, "Proof has hash");
assert(proof2.reasonCodes.length === 1, "Proof includes reason codes");

const verification2 = verifyDeniedDecisionProof(proof2);
assert(verification2.valid, "Proof verifies correctly");

const tamperedProof = { ...proof2, message: "tampered" };
const tamperedVerification = verifyDeniedDecisionProof(tamperedProof);
assert(!tamperedVerification.valid, "Tampered proof fails verification");

// SUMMARY
console.log("\n" + "═".repeat(80));
console.log("  TEST SUMMARY");
console.log("═".repeat(80));
console.log(`\n  Passed: ${passed}`);
console.log(`  Failed: ${failed}`);
console.log(`  Total:  ${passed + failed}`);

if (failed === 0) {
  console.log("\n  ✅ All tests passed!\n");
  process.exit(0);
} else {
  console.log("\n  ❌ Some tests failed\n");
  process.exit(1);
}
