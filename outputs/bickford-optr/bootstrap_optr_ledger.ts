#!/usr/bin/env bun
/**
 * Bootstrap OPTR compliance ledger: ensures ledger file exists and is valid
 */
import { existsSync, writeFileSync } from "fs";
import { log, logError } from "../logger";

const ledgerPath = "outputs/bickford-optr/production_ledger.jsonl";

try {
  if (!existsSync(ledgerPath)) {
    writeFileSync(ledgerPath, "");
    log(`Created OPTR ledger at ${ledgerPath}`);
  } else {
    log(`OPTR ledger already exists at ${ledgerPath}`);
  }
  log("Ledger bootstrap complete.");
  console.log("Ledger bootstrap complete.");
  updateStatus("bootstrap_optr_ledger.ts", "success");
} catch (err) {
  logError("Error during OPTR ledger bootstrap", err);
  updateStatus(
    "bootstrap_optr_ledger.ts",
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
