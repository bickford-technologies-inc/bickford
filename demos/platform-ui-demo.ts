#!/usr/bin/env bun

/**
 * Platform UI Demo
 * Seeds platform with demo data for UI testing
 */

import { TamperEvidentLedger } from "../platform/core/ledger";
import { EnforcementEngine } from "../platform/core/enforcement-engine";
import type { Canon, Action } from "../platform/core/types";

async function seedDemoData() {
  console.log("🌱 Seeding demo data for Platform UI...\n");

  const ledger = new TamperEvidentLedger(":memory:");
  const enforcementEngine = new EnforcementEngine((entry) =>
    ledger.append(entry),
  );

  // Create demo canon
  const canon: Canon = {
    id: "canon_demo_policy",
    name: "Demo Policy",
    version: "1.0.0",
    rules: [
      {
        id: "rule_no_sensitive_data",
        type: "forbid",
        condition: "sensitive",
        action: "training",
        severity: "critical",
        message: "Sensitive data not allowed in training",
      },
    ],
    enforcement: "hard-fail",
    metadata: {
      author: "demo",
      created: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    },
  };

  // Generate enforcement events
  console.log("📊 Generating 50 enforcement events...");

  for (let i = 0; i < 50; i++) {
    const action: Action = {
      type: i % 5 === 0 ? "training_sensitive" : "training",
      payload: {
        data: i % 5 === 0 ? "sensitive data" : "normal data",
      },
      context: {
        userId: "demo-user",
        organizationId: "demo-org",
        requestId: crypto.randomUUID(),
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
      },
    };

    await enforcementEngine.enforce(canon, action);
  }

  // Verify ledger
  const entries = await ledger.getEntries(100);
  const integrity = await ledger.verifyIntegrity();

  console.log("✅ Demo data seeded successfully!");
  console.log(`   Ledger entries: ${entries.length}`);
  console.log(`   Integrity: ${integrity.valid ? "✅ Valid" : "❌ Invalid"}`);
  console.log(
    `   Allowed: ${entries.filter((e) => e.eventType === "enforcement.allowed").length}`,
  );
  console.log(
    `   Denied: ${entries.filter((e) => e.eventType === "enforcement.denied").length}`,
  );
  console.log("\n🎨 Platform UI ready at: http://localhost:3000/platform");
  console.log(
    "🔍 Decision Trace Viewer: http://localhost:3000/platform/decision-trace-viewer",
  );
  console.log(
    "📊 Compression Dashboard: http://localhost:3000/platform/compression-dashboard",
  );

  ledger.close();
}

seedDemoData().catch(console.error);
