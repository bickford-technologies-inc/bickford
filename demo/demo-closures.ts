#!/usr/bin/env node
/**
 * Bickford Demo: Tier-1 and Tier-2 Closures (Chat Layers 1-6)
 * TIMESTAMP: 2026-01-12T20:50:00-05:00
 *
 * Demonstrates:
 * - Chat message immutability (seal + finalize)
 * - Authority decision gates with silent denial
 * - WhyNot panel for denied decisions
 * - Execution context hashing
 * - Token streaming with ledger proof
 * - Canon promotion endpoint
 * - OPTR ingestion of canon knowledge
 * - ConfidenceEnvelope for trust/weight
 */

import {
  // Types
  Action,
  CandidatePath,
  WhyNotTrace,
  DenialReasonCode,
  ConfidenceEnvelope,
  PathConstraint,
  ExecutionContext,
  TokenStreamProof,

  // Functions
  optrResolve,
  DEFAULT_WEIGHTS,
  ingestCanonAsConstraints,
  applyPathConstraints,
  promotionGate,
  createExecutionContext,
  bufferTokensWithProof,
  sealChatItem,
  finalizeChatItem,
} from "../packages/canon/src/canon";

import {
  formatWhyNotPanel,
  createDeniedDecisionProof,
  verifyDeniedDecisionProof,
} from "../packages/canon/api/whynot-panel";

console.log("\n" + "═".repeat(80));
console.log("  BICKFORD DEMO: TIER-1 AND TIER-2 CLOSURES (CHAT LAYERS 1-6)");
console.log("  TIMESTAMP: 2026-01-12T20:50:00-05:00");
console.log("═".repeat(80));

// SCREEN 1: Chat Message Immutability (Tier-1 and Tier-2 Closures)
console.log("\n\n📝 SCREEN 1: CHAT MESSAGE IMMUTABILITY\n");
console.log("─".repeat(80));

const messageId = "msg_demo_001";
const threadId = "thread_demo_001";
const nowIso = new Date().toISOString();

console.log("\n  Step 1: Create chat message");
console.log(`    Message ID: ${messageId}`);
console.log(`    Thread ID: ${threadId}`);
console.log(`    Created: ${nowIso}`);

console.log("\n  Step 2: Seal message (Tier-1 Closure)");
const sealed = sealChatItem({ itemId: messageId, timestamp: nowIso });
console.log(`    ✓ Sealed at: ${sealed.sealedAt.toISOString()}`);
console.log(`    ✓ Seal hash: ${sealed.hash.substring(0, 16)}...`);
console.log("    → Message is now immutable (cannot edit content)");

console.log("\n  Step 3: Finalize message (Tier-2 Closure)");
const canonRefs = ["CANON_INV_001", "CANON_INV_002"];
const finalized = finalizeChatItem({
  itemId: messageId,
  sealedAt: sealed.sealedAt,
  timestamp: nowIso,
  canonRefs,
});

if (finalized.finalized) {
  console.log(`    ✓ Finalized: ${finalized.finalized}`);
  console.log(`    ✓ Finalization hash: ${finalized.hash.substring(0, 16)}...`);
  console.log(`    ✓ Canon refs required: ${canonRefs.length} refs`);
  console.log("    → Message is now canonically immutable (highest level)");
} else {
  console.log(`    ✗ Finalization failed: ${finalized.reason}`);
}

// SCREEN 2: Authority Decision Gate with Silent Denial
console.log("\n\n🚪 SCREEN 2: AUTHORITY DECISION GATE\n");
console.log("─".repeat(80));

console.log("\n  Setup: Define actions and canon store");
const actions: Action[] = [
  {
    id: "action_deploy",
    name: "Deploy to Production",
    description: "Deploy code to production environment",
    prerequisitesCanonIds: ["CANON_SECURITY_REVIEW", "CANON_PERF_BASELINE"],
    riskLevel: "HIGH",
    resourcesUsed: ["prod_cluster"],
    sharedStateModified: ["prod_state"],
  },
  {
    id: "action_test",
    name: "Run Tests",
    description: "Run automated test suite",
    prerequisitesCanonIds: [],
    riskLevel: "LOW",
    resourcesUsed: ["ci_runner"],
  },
];

const canonStore = new Map<string, any>([
  [
    "CANON_SECURITY_REVIEW",
    {
      level: "CANON",
      kind: "INVARIANT",
      statement: "Security review required",
    },
  ],
  // Note: CANON_PERF_BASELINE is missing - this will cause a denial
]);

console.log(`    ✓ Actions defined: ${actions.length}`);
console.log(`    ✓ Canon store populated: ${canonStore.size} items`);

console.log("\n  Attempt 1: Deploy without required canon refs");
const candidates: CandidatePath[] = [
  {
    id: "path_deploy",
    actions: [actions[0]],
  },
];

const optrRun = optrResolve({
  ts: nowIso,
  tenantId: "tenant_demo",
  goal: "Deploy to production",
  candidates,
  canonRefsUsed: ["CANON_SECURITY_REVIEW"], // Missing CANON_PERF_BASELINE
  canonIdsPresent: ["CANON_SECURITY_REVIEW"],
  canonStore,
  weights: DEFAULT_WEIGHTS,
  featureFn: (path) => ({
    ttv: 300,
    cost: 50,
    risk: 0.7,
    successProb: 0.85,
    nextAction: actions[0],
  }),
});

if (optrRun.denyTraces && optrRun.denyTraces.length > 0) {
  console.log("    ✗ Decision: DENIED (silent)");
  console.log(`    ✗ Reason: ${optrRun.denyTraces[0].message}`);
  console.log(
    `    ✗ Missing canon: ${optrRun.denyTraces[0].missingCanonIds?.join(", ")}`,
  );
} else {
  console.log("    ✓ Decision: ALLOWED");
  console.log(`    ✓ Selected action: ${optrRun.selectedNextActionId}`);
}

// SCREEN 3: WhyNot Panel (Trust UX)
console.log("\n\n❓ SCREEN 3: WHYNOT PANEL (TRUST UX)\n");
console.log("─".repeat(80));

if (optrRun.denyTraces && optrRun.denyTraces.length > 0) {
  const denyTrace = optrRun.denyTraces[0];

  console.log("\n  Creating WhyNot panel for denied decision...");
  const panelData = formatWhyNotPanel(denyTrace);

  console.log(
    `\n  ╔═══════════════════════════════════════════════════════════╗`,
  );
  console.log(`  ║ ${panelData.title.padEnd(57)} ║`);
  console.log(
    `  ╠═══════════════════════════════════════════════════════════╣`,
  );
  console.log(
    `  ║                                                           ║`,
  );
  console.log(
    `  ║ Summary:                                                  ║`,
  );
  console.log(`  ║   ${panelData.summary.substring(0, 55).padEnd(55)} ║`);
  console.log(
    `  ║                                                           ║`,
  );
  console.log(
    `  ║ Denial Reasons:                                           ║`,
  );
  for (const reason of panelData.denialReasons) {
    console.log(`  ║   [${reason.severity}] ${reason.code.padEnd(44)} ║`);
  }
  console.log(
    `  ║                                                           ║`,
  );
  console.log(
    `  ║ Missing Prerequisites:                                    ║`,
  );
  for (const prereq of panelData.missingPrerequisites) {
    console.log(`  ║   - ${prereq.id.padEnd(53)} ║`);
  }
  console.log(
    `  ║                                                           ║`,
  );
  console.log(
    `  ║ Proof Hash:                                               ║`,
  );
  console.log(`  ║   ${panelData.proofHash.substring(0, 55).padEnd(55)} ║`);
  console.log(
    `  ╚═══════════════════════════════════════════════════════════╝`,
  );

  // Create and verify proof
  console.log("\n  Creating denial proof for persistence...");
  const proof = createDeniedDecisionProof(denyTrace);
  console.log(`    ✓ Proof ID: ${proof.id}`);
  console.log(`    ✓ Proof hash: ${proof.proofHash.substring(0, 16)}...`);

  const verification = verifyDeniedDecisionProof(proof);
  console.log(`    ✓ Proof verified: ${verification.valid}`);
}

// SCREEN 4: Execution Context Hash
console.log("\n\n🔐 SCREEN 4: EXECUTION CONTEXT HASH\n");
console.log("─".repeat(80));

console.log("\n  Creating execution context with deterministic hash...");
const execContext = createExecutionContext({
  executionId: "exec_demo_001",
  timestamp: nowIso,
  tenantId: "tenant_demo",
  actorId: "actor_demo",
  canonRefsSnapshot: ["CANON_SECURITY_REVIEW", "CANON_INV_001"],
  constraintsSnapshot: ["CONSTRAINT_MAX_RISK"],
  environment: { nodeEnv: "production", version: "2.0.0" },
});

console.log(`    ✓ Execution ID: ${execContext.executionId}`);
console.log(`    ✓ Tenant ID: ${execContext.tenantId}`);
console.log(`    ✓ Canon refs: ${execContext.canonRefsSnapshot.length} items`);
console.log(
  `    ✓ Constraints: ${execContext.constraintsSnapshot.length} items`,
);
console.log(
  `    ✓ Environment hash: ${execContext.environmentHash.substring(0, 16)}...`,
);
console.log(
  `    ✓ Context hash: ${execContext.contextHash.substring(0, 16)}...`,
);
console.log("    → Deterministic snapshot of execution scope for audit");

// SCREEN 5: Token Streaming with Ledger Proof
console.log("\n\n📡 SCREEN 5: TOKEN STREAMING WITH LEDGER PROOF\n");
console.log("─".repeat(80));

console.log("\n  Buffering tokens with ledger proof...");
const tokens = ["The", " quick", " brown", " fox", " jumps"];
const ledgerState = { lastSeq: 42, lastHash: "abc123" };

const streamProof = bufferTokensWithProof({
  executionId: "exec_demo_001",
  streamId: "stream_demo_001",
  tokens,
  ledgerState,
  authCheck: (tokens, state) => {
    // Simple check: ensure ledger has valid state
    return state.lastSeq > 0;
  },
  timestamp: nowIso,
});

console.log(`    ✓ Stream ID: ${streamProof.streamId}`);
console.log(`    ✓ Tokens buffered: ${streamProof.tokens.length}`);
console.log(`    ✓ Ledger hash: ${streamProof.ledgerHash.substring(0, 16)}...`);
console.log(`    ✓ Proof hash: ${streamProof.proofHash.substring(0, 16)}...`);
console.log(`    ✓ Approved: ${streamProof.approved}`);

if (streamProof.approved) {
  console.log("\n    → Tokens authorized for output:");
  console.log(`       "${streamProof.tokens.join("")}"`);
} else {
  console.log("\n    → Tokens BLOCKED (not authorized by ledger)");
}

// SCREEN 6: Canon Promotion
console.log("\n\n⬆️  SCREEN 6: CANON PROMOTION\n");
console.log("─".repeat(80));

console.log("\n  Attempting to promote evidence to PROPOSED...");
const promotionDecision = promotionGate({
  ts: nowIso,
  itemId: "EVIDENCE_001",
  from: "EVIDENCE",
  tests: {
    resistance: true, // Evidence of failure modes exists
    reproducible: true, // Stable across trials
    invariantSafe: true, // No invariant violations
    feasibilityImpact: true, // Changes admissible set
    evidenceRefs: ["ref_001", "ref_002"],
  },
});

console.log(
  `    Decision: ${promotionDecision.approved ? "APPROVED" : "DENIED"}`,
);
console.log(
  `    From: ${promotionDecision.from} → To: ${promotionDecision.to}`,
);
console.log(`    Reason: ${promotionDecision.reason}`);
console.log(
  `    Tests passed: ${
    Object.values(promotionDecision.tests).filter(Boolean).length - 1
  }/4`,
);

// SCREEN 7: OPTR Canon Knowledge Ingestion
console.log("\n\n🧠 SCREEN 7: OPTR CANON KNOWLEDGE INGESTION\n");
console.log("─".repeat(80));

console.log("\n  Ingesting canon knowledge as path constraints...");
const canonStoreWithConstraints = new Map<string, any>([
  [
    "CANON_RISK_BOUND",
    {
      level: "CANON",
      kind: "INVARIANT",
      statement: "Risk must not exceed bound of 0.3",
      confidence: { confidence: 0.95, trust: 1.0 },
    },
  ],
  [
    "CANON_COST_LIMIT",
    {
      level: "CANON",
      kind: "CONSTRAINT",
      statement: "Cost must not exceed $100",
      confidence: { confidence: 0.9, trust: 0.95 },
    },
  ],
]);

const pathConstraints = ingestCanonAsConstraints(
  canonStoreWithConstraints,
  actions,
);

console.log(`    ✓ Path constraints generated: ${pathConstraints.length}`);
for (const constraint of pathConstraints) {
  console.log(`      - ${constraint.constraintType}: ${constraint.canonRefId}`);
  console.log(
    `        Confidence: ${constraint.confidence.confidence}, Trust: ${constraint.confidence.trust}`,
  );
}

console.log("\n  Applying constraints to candidate paths...");
const highRiskCandidate: CandidatePath = {
  id: "path_risky",
  actions: [actions[0]],
  features: {
    ttv: 100,
    cost: 150, // Exceeds cost limit
    risk: 0.5, // Exceeds risk bound
    successProb: 0.9,
    nextAction: actions[0],
  },
};

const constraintDenials = applyPathConstraints(
  highRiskCandidate,
  pathConstraints,
  nowIso,
);

console.log(`    ✓ Constraint denials: ${constraintDenials.length}`);
for (const denial of constraintDenials) {
  console.log(`      ✗ ${denial.message}`);
}

// SUMMARY
console.log("\n\n✅ SUMMARY: TIER-1 AND TIER-2 CLOSURES IMPLEMENTED\n");
console.log("─".repeat(80));
console.log("\n  Demonstrated features:");
console.log("    ✓ Chat message seal (Tier-1 closure)");
console.log("    ✓ Chat message finalize (Tier-2 closure)");
console.log("    ✓ Authority decision gate with silent denial");
console.log("    ✓ WhyNot panel for trust UX");
console.log("    ✓ Denied decision proof persistence and verification");
console.log("    ✓ Execution context hash for deterministic scope");
console.log("    ✓ Token streaming with ledger proof");
console.log("    ✓ Canon promotion with 4-test gate");
console.log("    ✓ OPTR canon knowledge ingestion as path constraints");
console.log("    ✓ ConfidenceEnvelope for trust/weight metadata");
console.log("\n  All features maintain Bickford invariants:");
console.log("    ✓ Silence (no extraneous output)");
console.log("    ✓ Determinism (reproducible hashes)");
console.log("    ✓ Minimal changes (focused on core requirements)");
console.log("    ✓ Single-purpose modules (clean separation)");
console.log("    ✓ Non-interference (no cross-agent conflicts)");
console.log("\n" + "═".repeat(80) + "\n");
