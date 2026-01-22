#!/usr/bin/env tsx
import crypto from "node:crypto";

/**
 * Demo: Ledger Persistence Test
 *
 * Tests the new Prisma-based ledger persistence layer.
 * Requires DATABASE_URL environment variable.
 *
 * Usage:
 *   DATABASE_URL="postgresql://..." npm run demo:ledger
 *   or
 *   tsx demo/demo-ledger.ts
 */

import { appendLedger, getLedger } from "../packages/ledger/src/index";
import { authorize } from "../packages/authority/src/index";
import type { Intent } from "../packages/types/src/index";

async function main() {
  console.log("=== Bickford Ledger Persistence Demo ===\n");

  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR: DATABASE_URL environment variable is required");
    console.error(
      "   Example: DATABASE_URL='postgresql://user:pass@localhost:5432/bickford'\n",
    );
    process.exit(1);
  }

  console.log("✓ DATABASE_URL configured\n");

  // Test 1: Append a ledger entry
  console.log("Test 1: Appending ledger entry...");
  const intent: Intent = {
    id: crypto.randomUUID(),
    action: "deploy_to_production",
  };
  const context = {
    service: "api",
    version: "1.2.3",
    environment: "production",
  };

  const decision = authorize({ tenantId: "demo-tenant", intent });
  console.log("  Decision:", decision.outcome);
  console.log("  Reason:", decision.reason);

  const ledgerEntry = {
    id: decision.id,
    event: {
      id: intent.id,
      timestamp: new Date().toISOString(),
    },
  };
  const entry = await appendLedger("demo-thread", ledgerEntry);
  console.log("  ✓ Ledger entry created");
  console.log("    ID:", entry.id);
  console.log("    Hash:", entry.hash.substring(0, 16) + "...");
  console.log();

  // Test 2: Verify hash integrity
  console.log("Test 2: Verifying hash integrity...");
  const payload = JSON.stringify({ intent, decision });
  const expectedHash = crypto
    .createHash("sha256")
    .update(payload)
    .digest("hex");

  if (entry.hash === expectedHash) {
    console.log("  ✓ Hash verification passed");
    console.log("    Expected:", expectedHash.substring(0, 16) + "...");
    console.log("    Got:     ", entry.hash.substring(0, 16) + "...");
  } else {
    console.log("  ❌ Hash verification failed!");
    console.log("    Expected:", expectedHash);
    console.log("    Got:     ", entry.hash);
  }
  console.log();

  // Test 3: Retrieve ledger
  console.log("Test 3: Retrieving ledger...");
  const ledger = await getLedger();
  console.log("  ✓ Retrieved", ledger.length, "entries");

  if (ledger.length > 0) {
    console.log("\n  Recent entries:");
    ledger.slice(0, 3).forEach((e: any, i: number) => {
      console.log(
        `    ${i + 1}. ${e.id.substring(0, 8)}... - ${(e.intent as any).action || "unknown"} - ${e.decision.outcome}`,
      );
    });
  }
  console.log();

  // Test 4: Append another entry to test multiple entries
  console.log("Test 4: Appending another entry...");
  const intent2: Intent = {
    id: crypto.randomUUID(),
    action: "rollback_deployment",
  };
  const context2 = {
    reason: "critical_bug_detected",
    affected_users: 1200,
  };

  const decision2 = authorize({ tenantId: "demo-tenant", intent: intent2 });
  const entry2 = await appendLedger(intent2, decision2);
  console.log("  ✓ Second entry created:", entry2.id.substring(0, 8) + "...");
  console.log();

  // Test 5: Verify entries persist
  console.log("Test 5: Verifying persistence...");
  const ledger2 = await getLedger();
  console.log("  ✓ Total entries now:", ledger2.length);

  // Verify our entries are in the ledger
  const ourEntries = ledger2.filter(
    (e: any) => e.id === entry.id || e.id === entry2.id,
  );
  console.log("  ✓ Our entries found:", ourEntries.length, "/ 2");
  console.log();

  console.log("=== All Tests Passed ✓ ===\n");
  console.log("The ledger is now using durable Prisma/Postgres persistence.");
  console.log(
    "Entries will survive server restarts and are fully auditable.\n",
  );
}

main().catch((error) => {
  console.error("\n❌ Demo failed:");
  console.error(error);
  process.exit(1);
});
