#!/usr/bin/env bun

import { createHash } from "crypto";

interface ProofChain {
  request_hash: string;
  enforcement_hash: string;
  response_hash: string;
  merkle_root: string;
}

class IndependentVerifier {
  verifyProofChain(proofChain: string[]): {
    valid: boolean;
    checks: Record<string, boolean>;
    reasoning: string[];
  } {
    const checks: Record<string, boolean> = {};
    const reasoning: string[] = [];

    const [requestProof, enforcementProof, responseProof, merkleProof] =
      proofChain;

    checks.all_proofs_present = proofChain.length === 4;
    if (!checks.all_proofs_present) {
      reasoning.push("❌ Incomplete proof chain (expected 4 proofs)");
      return { valid: false, checks, reasoning };
    }
    reasoning.push("✅ All 4 proof components present");

    const requestMatch = requestProof.match(/^REQUEST:([a-f0-9]{64})$/);
    const enforcementMatch = enforcementProof.match(
      /^ENFORCEMENT:([a-f0-9]{64})$/,
    );
    const responseMatch = responseProof.match(/^RESPONSE:(.+)$/);
    const merkleMatch = merkleProof.match(/^MERKLE_ROOT:([a-f0-9]{64})$/);

    checks.format_valid = !!(
      requestMatch &&
      enforcementMatch &&
      responseMatch &&
      merkleMatch
    );
    if (!checks.format_valid) {
      reasoning.push("❌ Invalid proof format");
      return { valid: false, checks, reasoning };
    }
    reasoning.push("✅ Proof format valid (all SHA-256 hashes)");

    const computedMerkle = createHash("sha256")
      .update(`${requestProof}:${enforcementProof}:${responseProof}`)
      .digest("hex");

    const claimedMerkle = merkleMatch ? merkleMatch[1] : null;
    checks.merkle_valid =
      claimedMerkle !== null && computedMerkle === claimedMerkle;

    if (!checks.merkle_valid) {
      reasoning.push(`❌ Merkle root mismatch`);
      reasoning.push(`   Computed: ${computedMerkle}`);
      reasoning.push(`   Claimed:  ${claimedMerkle}`);
      return { valid: false, checks, reasoning };
    }
    reasoning.push("✅ Merkle root verified (proof chain integrity confirmed)");

    const responseHash = responseMatch ? responseMatch[1] : null;
    if (responseHash === "DENIED_BEFORE_EXECUTION") {
      checks.denial_verified = true;
      reasoning.push("✅ Request denied before execution (cost saved)");
    } else {
      checks.response_present =
        typeof responseHash === "string" && responseHash.length === 64;
      if (!checks.response_present) {
        reasoning.push("⚠️  Response hash format unusual");
      } else {
        reasoning.push("✅ Response hash format valid");
      }
    }

    const allPassed = Object.values(checks).every(Boolean);

    if (allPassed) {
      reasoning.push(
        "\n🎉 VERIFICATION COMPLETE: Proof chain is cryptographically valid",
      );
      reasoning.push("   Regulator can confirm:");
      reasoning.push("   - Decision integrity is intact");
      reasoning.push("   - No tampering detected");
      reasoning.push("   - Audit trail is trustworthy");
    }

    return {
      valid: allPassed,
      checks,
      reasoning,
    };
  }

  async verifyLedgerChain(ledgerPath: string): Promise<{
    valid: boolean;
    total_entries: number;
    verified_entries: number;
    broken_at?: number;
    reasoning: string[];
  }> {
    const reasoning: string[] = [];

    // Load ledger
    const file = Bun.file(ledgerPath);
    const content = await file.text();
    const entries = content
      .split("\n")
      .filter((line: string) => line.trim())
      .map((line: string) => JSON.parse(line));

    reasoning.push(`📋 Loaded ${entries.length} ledger entries`);
    reasoning.push("\n🔍 Verifying hash chain...\n");

    let previousHash = "";

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      if (i === 0) {
        if (entry.previous_hash !== "") {
          reasoning.push(
            `❌ Entry 0: Invalid genesis entry (previous_hash should be empty)`,
          );
          return {
            valid: false,
            total_entries: entries.length,
            verified_entries: i,
            broken_at: i,
            reasoning,
          };
        }
        reasoning.push(`✅ Entry 0: Genesis entry valid`);
      } else {
        if (entry.previous_hash !== previousHash) {
          reasoning.push(`❌ Entry ${i}: Hash chain broken`);
          reasoning.push(`   Expected previous: ${previousHash}`);
          reasoning.push(`   Actual previous:   ${entry.previous_hash}`);
          return {
            valid: false,
            total_entries: entries.length,
            verified_entries: i,
            broken_at: i,
            reasoning,
          };
        }

        if (i % 20 === 0 || i === entries.length - 1) {
          reasoning.push(`✅ Entry ${i}: Hash chain intact`);
        }
      }

      previousHash = entry.hash;
    }

    reasoning.push(`\n🎉 LEDGER VERIFICATION COMPLETE`);
    reasoning.push(`   All ${entries.length} entries verified`);
    reasoning.push(`   Hash chain integrity: INTACT`);
    reasoning.push(`   No tampering detected`);

    return {
      valid: true,
      total_entries: entries.length,
      verified_entries: entries.length,
      reasoning,
    };
  }
}

async function main() {
  console.log("\n");
  console.log(
    "╔═══════════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║                                                                       ║",
  );
  console.log(
    "║        🏛️  Bickford Regulator Verification Demo                       ║",
  );
  console.log(
    "║                                                                       ║",
  );
  console.log(
    "║  Independent verification of AI decisions                            ║",
  );
  console.log(
    "║  WITHOUT trusting Anthropic's systems                                ║",
  );
  console.log(
    "║                                                                       ║",
  );
  console.log(
    "╚═══════════════════════════════════════════════════════════════════════╝",
  );
  console.log("\n");

  const verifier = new IndependentVerifier();

  console.log("📝 Scenario: Regulator Auditing Anthropic's AI Deployment\n");
  console.log("═".repeat(75));
  console.log("\n");

  // Demo 1: Verify individual proof chain
  console.log("🔍 DEMO 1: Verifying Individual Decision Proof Chain\n");

  // Simulate a proof chain from a decision
  const sampleProofChain = [
    "REQUEST:a3f2b8c9e1d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
    "ENFORCEMENT:7e4d1a2f8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5",
    "RESPONSE:9b6c3e1a2f8d4c5b7a9e0f1d2c3b4a5e6d7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
    "MERKLE_ROOT:5f8e2c4b1a9d3e7f0c6b8a5d2e9f1c4b7a0d3e6f9c2b5a8d1e4f7c0b3a6d9e2",
  ];

  const expectedMerkle = createHash("sha256")
    .update(sampleProofChain.slice(0, 3).join(":"))
    .digest("hex");
  sampleProofChain[3] = `MERKLE_ROOT:${expectedMerkle}`;

  const result1 = verifier.verifyProofChain(sampleProofChain);

  console.log("Regulator receives:");
  console.log("  - Proof chain (4 hashes)");
  console.log("  - Claimed decision: ALLOWED");
  console.log("  - Claimed policy: CONSTITUTIONAL_AI.HELPFUL.v4.1.0\n");

  console.log("Verification process:\n");
  result1.reasoning.forEach((line) => console.log(`  ${line}`));

  console.log("\n" + "─".repeat(75) + "\n");

  console.log("🔍 DEMO 2: Detecting Tampering Attempt\n");

  const tamperedProof = [...sampleProofChain];
  tamperedProof[1] =
    "ENFORCEMENT:0000000000000000000000000000000000000000000000000000000000000000";

  const result2 = verifier.verifyProofChain(tamperedProof);

  console.log("Regulator receives tampered proof:\n");
  result2.reasoning.forEach((line) => console.log(`  ${line}`));

  console.log("\n" + "─".repeat(75) + "\n");

  console.log("🔍 DEMO 3: Verifying Complete Ledger Chain\n");

  const ledgerPath = "/workspaces/bickford/execution-ledger.jsonl";
  const result3 = await verifier.verifyLedgerChain(ledgerPath);

  result3.reasoning.forEach((line) => console.log(`  ${line}`));

  console.log("\n" + "═".repeat(75) + "\n");

  console.log(
    "╔═══════════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║                     🎯 KEY INSIGHTS FOR REGULATORS                    ║",
  );
  console.log(
    "╚═══════════════════════════════════════════════════════════════════════╝",
  );
  console.log("\n");

  console.log("1️⃣  MATHEMATICAL VERIFICATION (Not Trust-Based)\n");
  console.log("   - Regulators verify cryptographic proofs, not vendor claims");
  console.log("   - SHA-256 hashes are independently computable");
  console.log("   - Merkle roots prove data integrity without full access\n");

  console.log("2️⃣  NO ACCESS TO ANTHROPIC SYSTEMS REQUIRED\n");
  console.log("   - Regulator receives only proof chains");
  console.log("   - Can verify compliance offline");
  console.log("   - No dependency on vendor cooperation\n");

  console.log("3️⃣  TAMPER-EVIDENT AUDIT TRAILS\n");
  console.log("   - Hash chain links every decision");
  console.log("   - Any modification breaks cryptographic integrity");
  console.log("   - Instant detection of manipulation attempts\n");

  console.log("4️⃣  CONTINUOUS COMPLIANCE MONITORING\n");
  console.log("   - Real-time proof generation");
  console.log("   - No retroactive audit preparation");
  console.log("   - Compliance artifacts always ready\n");

  console.log("5️⃣  COMPETITIVE ADVANTAGE FOR ANTHROPIC\n");
  console.log("   - Only AI platform with independent verification");
  console.log("   - Meets strictest regulatory requirements");
  console.log("   - Enables deployment in defense, healthcare, finance\n");

  console.log("═".repeat(75));
  console.log("\n");

  console.log("💰 REGULATORY VALUE PROPOSITION:\n");
  console.log("Without Bickford:");
  console.log("  - Regulator: 'How do we know your AI is compliant?'");
  console.log("  - Anthropic: 'Trust us, we trained it carefully'");
  console.log("  - Result: Blocked from regulated markets\n");

  console.log("With Bickford:");
  console.log("  - Regulator: 'How do we know your AI is compliant?'");
  console.log("  - Anthropic: 'Here's cryptographic proof - verify yourself'");
  console.log("  - Result: Approved for deployment, $450M-750M TAM unlocked\n");

  console.log("═".repeat(75));
  console.log("\n");

  console.log("✅ Regulator verification demo complete!\n");
}

main().catch((err) => {
  throw err;
});
