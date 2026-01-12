#!/usr/bin/env node
/**
 * Record Deploy Event - Mandatory ledger proof for all deployments
 * 
 * Called from CI to record deploy events in the ledger.
 * INVARIANT: All successful deployments MUST have ledger proof.
 */

const COMMIT_SHA = process.env.COMMIT_SHA || process.env.GITHUB_SHA || "unknown";
const ENVIRONMENT = process.env.ENVIRONMENT || "staging";
const STATUS = process.env.STATUS || "success";
const BUILD_ID = process.env.BUILD_ID;

async function recordDeployEvent() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ INVARIANT VIOLATION: DATABASE_URL required for deploy event");
    console.error("   All deployments must be ledgered");
    process.exit(1);
  }

  try {
    const { recordDeployEvent: recordFn } = await import("@bickford/ledger");

    const result = await recordFn(COMMIT_SHA, ENVIRONMENT, STATUS, BUILD_ID);

    console.log("✅ Deploy event recorded in ledger");
    console.log(`   Deploy ID: ${result.id}`);
    console.log(`   Commit: ${COMMIT_SHA}`);
    console.log(`   Environment: ${ENVIRONMENT}`);
    console.log(`   Status: ${STATUS}`);
    console.log(`   Ledger Hash (MANDATORY): ${result.ledgerHash}`);

    // Write ledger hash to GitHub output for subsequent steps
    if (process.env.GITHUB_OUTPUT) {
      const fs = await import("fs");
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `ledger_hash=${result.ledgerHash}\n`
      );
    }
  } catch (error) {
    console.error("❌ CRITICAL: Failed to record deploy event:", error.message);
    console.error("   Deploy cannot proceed without ledger proof");
    process.exit(1);
  }
}

recordDeployEvent();
