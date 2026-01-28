#!/usr/bin/env bun
/**
 * @meta
 * name: Integration Test
 * description: Recursively checks all .ts scripts in outputs/ and subdirectories
 * category: integration
 * author: Bickford Automation
 * last_updated: 2026-01-28
 * dependencies: logger.ts
 */
import { log, logError } from "./logger";
import { readdirSync, statSync, existsSync, readFileSync } from "fs";
import { join } from "path";
// Bun environment check
if (typeof Bun === "undefined") {
  logError(
    "[integration_test.ts] ERROR: This script must be run with Bun. See outputs/DEVELOPER_ONBOARDING.md.",
    undefined,
  );
  process.exit(1);
}

// Usage/help
if (process.argv.includes("--help")) {
  console.log(
    `Usage: bun run outputs/integration_test.ts\nRecursively checks all .ts scripts in outputs/ and subdirectories.`,
  );
  process.exit(0);
}

function findScripts(dir: string): string[] {
  let scripts: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      scripts = scripts.concat(findScripts(full));
    } else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
      scripts.push(full);
    }
  }
  return scripts;
}

const scripts = findScripts("outputs");
let allPass = true;
for (const script of scripts) {
  if (existsSync(script)) {
    log(`Integration: Script found at ${script}`);
    console.log(`✅ Script found at ${script}`);
  } else {
    logError(`Integration: Script missing at ${script}`, undefined);
    console.log(`❌ Script missing at ${script}`);
    allPass = false;
  }
}

if (allPass) {
  log("Integration test PASSED: All scripts present in outputs/ tree.");
  console.log(
    "\n🎉 Integration test PASSED: All scripts present in outputs/ tree.",
  );
  updateStatus("integration_test.ts", "success");
} else {
  logError("Integration test FAILED: Some scripts are missing.", undefined);
  console.log("\n⚠️ Integration test FAILED: Some scripts are missing.");
  updateStatus("integration_test.ts", "error", "Some scripts are missing.");
  process.exit(1);
}

// Status tracking
type Status = { script: string; status: string; time: string; error?: string };
function updateStatus(script: string, status: string, error?: string) {
  const fs = require("fs");
  const path = "outputs/automation_status.json";
  let arr: Status[] = [];
  if (fs.existsSync(path)) {
    try {
      arr = JSON.parse(fs.readFileSync(path, "utf-8"));
    } catch {}
  }
  arr = arr.filter((s: Status) => s.script !== script);
  arr.push({
    script,
    status,
    time: new Date().toISOString(),
    ...(error ? { error } : {}),
  });
  fs.writeFileSync(path, JSON.stringify(arr, null, 2));
}

// Ensure status file exists (self-healing)
const fs = require("fs");
const statusPath = "outputs/automation_status.json";
if (!fs.existsSync(statusPath)) {
  try {
    fs.writeFileSync(statusPath, "[]");
  } catch {}
}
// TODO: Add status archiving/rotation for long-term audit.
// EXTENSION POINT: Push status to monitoring dashboard or webhook.
