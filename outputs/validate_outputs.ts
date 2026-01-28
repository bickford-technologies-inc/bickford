#!/usr/bin/env bun
/**
 * @meta
 * name: Validate Outputs
 * description: Ensures all required outputs/ subdirectories and files exist
 * category: validation
 * author: Bickford Automation
 * last_updated: 2026-01-28
 * dependencies: logger.ts
 */
import { log, logError } from "./logger";
// Bun environment check
if (typeof Bun === "undefined") {
  logError(
    "[validate_outputs.ts] ERROR: This script must be run with Bun. See outputs/DEVELOPER_ONBOARDING.md.",
  );
  process.exit(1);
}

// Usage/help
if (process.argv.includes("--help")) {
  console.log(
    `Usage: bun run outputs/validate_outputs.ts\nEnsures all required outputs/ subdirectories and files exist.`,
  );
  process.exit(0);
}

/**
 * Validate required output directories and files for Bickford automation
 * Ensures all outputs/ subdirectories exist and are writable
 */
import { mkdirSync, existsSync, writeFileSync } from "fs";

const requiredDirs = [
  "outputs/customer-acquisition",
  "outputs/evidence-collection",
  "outputs/bickford-optr",
];

const requiredFiles = ["outputs/WORKFLOW_STATUS.md", "outputs/START_HERE.md"];

function ensureDir(path: string) {
  try {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
      console.log(`Created directory: ${path}`);
    } else {
      console.log(`Directory exists: ${path}`);
    }
  } catch (err) {
    console.error(
      `❌ Error creating directory ${path}:`,
      err instanceof Error ? err.message : String(err),
    );
    process.exit(1);
  }
}

function ensureFile(path: string) {
  try {
    if (!existsSync(path)) {
      writeFileSync(path, "");
      console.log(`Created file: ${path}`);
    } else {
      console.log(`File exists: ${path}`);
    }
  } catch (err) {
    console.error(
      `❌ Error creating file ${path}:`,
      err instanceof Error ? err.message : String(err),
    );
    process.exit(1);
  }
}

try {
  for (const dir of requiredDirs) {
    ensureDir(dir);
    log(`Checked directory: ${dir}`);
  }
  for (const file of requiredFiles) {
    ensureFile(file);
    log(`Checked file: ${file}`);
  }
  log("All required output directories and files are present.");
  console.log("\n✅ All required output directories and files are present.");
  updateStatus("validate_outputs.ts", "success");
} catch (err) {
  logError("Error during validation", err);
  updateStatus(
    "validate_outputs.ts",
    "error",
    err instanceof Error ? err.message : String(err),
  );
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
