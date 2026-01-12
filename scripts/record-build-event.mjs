#!/usr/bin/env node
/**
 * Record Build Event - Ledgers build success/failure
 * 
 * Called from CI to record build events in the ledger.
 * Creates immutable proof that a build occurred.
 */

const COMMIT_SHA = process.env.COMMIT_SHA || process.env.GITHUB_SHA || "unknown";
const BRANCH = process.env.BRANCH || process.env.GITHUB_REF_NAME || "unknown";
const STATUS = process.env.STATUS || "success";

async function recordBuildEvent() {
  // Skip if no DATABASE_URL (local builds, etc.)
  if (!process.env.DATABASE_URL) {
    console.log("⏭️  Skipping build event ledgering (no DATABASE_URL)");
    return;
  }

  try {
    // Dynamically import to avoid issues if not installed
    const { recordBuildEvent: recordFn } = await import("@bickford/ledger");

    const result = await recordFn(COMMIT_SHA, BRANCH, STATUS);

    console.log("✅ Build event recorded in ledger");
    console.log(`   Build ID: ${result.id}`);
    console.log(`   Commit: ${COMMIT_SHA}`);
    console.log(`   Branch: ${BRANCH}`);
    console.log(`   Status: ${STATUS}`);
    if (result.ledgerHash) {
      console.log(`   Ledger Hash: ${result.ledgerHash}`);
    }
  } catch (error) {
    console.error("❌ Failed to record build event:", error.message);
    // Don't fail the build if ledgering fails
    process.exit(0);
  }
}

recordBuildEvent();
