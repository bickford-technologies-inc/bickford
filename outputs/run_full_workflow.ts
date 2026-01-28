#!/usr/bin/env bun
/**
 * @meta
 * name: Run Full Workflow
 * description: Orchestrates the full Bickford automation workflow (lead gen, email, compliance, status)
 * category: orchestration
 * author: Bickford Automation
 * last_updated: 2026-01-28
 * dependencies: logger.ts, child_process, fs
 */
import { log, logError } from "./logger";
// Bun environment check
if (typeof Bun === "undefined") {
  logError(
    "[run_full_workflow.ts] ERROR: This script must be run with Bun. See outputs/DEVELOPER_ONBOARDING.md.",
  );
  process.exit(1);
}

// Usage/help
if (process.argv.includes("--help")) {
  console.log(
    `Usage: bun run outputs/run_full_workflow.ts\nOrchestrates the full Bickford automation workflow (lead gen, email, compliance, status).`,
  );
  process.exit(0);
}

const runLog: string[] = [];
function runStep(desc: string, cmd: string[], cwd?: string) {
  runLog.push(`\n## ${desc}\n`);
  const result = spawnSync(cmd[0], cmd.slice(1), { encoding: "utf-8", cwd });
  if (result.error) {
    runLog.push(`❌ Error: ${result.error.message}`);
    return false;
  }
  if (result.status !== 0) {
    runLog.push(`❌ Non-zero exit: ${result.status}\n${result.stderr}`);
    return false;
  }
  runLog.push(result.stdout);
  return true;
}

try {
  // 1. Lead Generation
  const leadGenScript = "outputs/customer-acquisition/lead_generation.ts";
  if (existsSync(leadGenScript)) {
    runStep("Lead Generation", ["bun", "run", leadGenScript]);
    log("Lead Generation step completed.");
  } else {
    log("Lead generation script not found. Skipping.");
    logError("Lead generation script missing");
  }

  // 2. Email Generation
  const emailGenScript =
    "outputs/customer-acquisition/email_outreach_generator.ts";
  if (existsSync(emailGenScript)) {
    runStep("Email Generation", ["bun", "run", emailGenScript]);
    log("Email Generation step completed.");
  } else {
    log("Email generation script not found. Skipping.");
    logError("Email generation script missing");
  }

  // 3. Compliance Ledger Verification
  const optrScript = "outputs/bickford-optr/optr_production_ready.ts";
  if (existsSync(optrScript)) {
    runStep("OPTR Compliance Ledger Verification", [
      "bun",
      "run",
      optrScript,
      "verify",
    ]);
    log("OPTR Compliance Ledger Verification step completed.");
  } else {
    log("OPTR compliance script not found. Skipping.");
    logError("OPTR compliance script missing");
  }

  // 4. Update Status Dashboard
  const statusPath = "outputs/WORKFLOW_STATUS.md";
  let statusContent = "";
  if (existsSync(statusPath)) {
    statusContent = `# Workflow Run Log\n\n${runLog.join("\n")}\n\n_Last run: ${new Date().toISOString()}_\n`;
    writeFileSync(statusPath, statusContent, { flag: "a" });
    log("Status dashboard updated.");
  }

  log("Full workflow complete.");
  console.log(
    "\n✅ Full workflow complete. See outputs/WORKFLOW_STATUS.md for details.",
  );
  updateStatus("run_full_workflow.ts", "success");
} catch (err) {
  logError("Error during workflow execution", err);
  updateStatus(
    "run_full_workflow.ts",
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
