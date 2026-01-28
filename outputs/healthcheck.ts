#!/usr/bin/env bun
/**
 * @meta
 * name: Healthcheck
 * description: Recursively checks all .ts scripts in outputs/ and subdirectories
 * category: healthcheck
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
    "[healthcheck.ts] ERROR: This script must be run with Bun. See outputs/DEVELOPER_ONBOARDING.md.",
    undefined,
  );
  process.exit(1);
}

// Usage/help
if (process.argv.includes("--help")) {
  console.log(
    `Usage: bun run outputs/healthcheck.ts\nRecursively checks all .ts scripts in outputs/ and subdirectories.`,
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
    log(`Healthcheck: Script found at ${script}`);
    console.log(`✅ Script found at ${script}`);
  } else {
    logError(`Healthcheck: Script missing at ${script}`, undefined);
    console.log(`❌ Script missing at ${script}`);
    allPass = false;
  }
}

// Print last status for each script
try {
  const statusPath = "outputs/automation_status.json";
  if (existsSync(statusPath)) {
    const arr = JSON.parse(readFileSync(statusPath, "utf-8"));
    console.log("\n---\nAutomation Status:");
    for (const s of arr) {
      console.log(
        `- ${s.script}: ${s.status} (${s.time})${s.error ? ` | Error: ${s.error}` : ""}`,
      );
    }
  }
} catch (err) {
  logError("Error reading automation_status.json", err);
}

if (allPass) {
  log("Healthcheck PASSED: All scripts present in outputs/ tree.");
  console.log("\n🎉 Healthcheck PASSED: All scripts present in outputs/ tree.");
} else {
  logError("Healthcheck FAILED: Some scripts are missing.", undefined);
  console.log("\n⚠️ Healthcheck FAILED: Some scripts are missing.");
  process.exit(1);
}
// TODO: Add script execution smoke test in future.
// EXTENSION POINT: Add per-script health logic here.
