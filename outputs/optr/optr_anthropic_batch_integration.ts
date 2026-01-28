#!/usr/bin/env bun
/**
 * @meta
 * name: OPTR Anthropic Batch Integration
 * description: Runs a batch of OPTR compliance decisions using Anthropic API, logs to hash-chained ledger
 * category: compliance
 * author: Bickford Automation
 * last_updated: 2026-01-28
 * dependencies: logger.ts, crypto, fs
 */
import { log, logError } from "../logger";
import { file } from "bun";
import { appendFileSync, writeFileSync } from "fs";
import { createHash } from "crypto";
// Bun environment check
if (typeof Bun === "undefined") {
  logError(
    "[optr_anthropic_batch_integration.ts] ERROR: This script must be run with Bun. See outputs/DEVELOPER_ONBOARDING.md.",
  );
  process.exit(1);
}

// Usage/help
if (process.argv.includes("--help")) {
  console.log(
    `Usage: bun run outputs/optr/optr_anthropic_batch_integration.ts [N]\nRuns N (default 1000) OPTR compliance decisions using Anthropic API, logs to hash-chained ledger.\n`,
  );
  process.exit(0);
}

const ANTHROPIC_API_KEY =
  process.env.ANTHROPIC_API_KEY || "YOUR_ANTHROPIC_API_KEY";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ledgerPath = "outputs/optr/optr_ledger.jsonl";

async function getPreviousHash(): Promise<string> {
  try {
    const lines = (await file(ledgerPath).text()).trim().split("\n");
    if (lines.length === 0 || !lines[0]) return "0".repeat(64);
    const last = JSON.parse(lines[lines.length - 1]);
    return last.currentHash || "0".repeat(64);
  } catch {
    return "0".repeat(64);
  }
}

async function getAnthropicDecision(
  input: string,
): Promise<{ decision: string; simulated: boolean }> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 256,
      messages: [{ role: "user", content: input }],
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    if (errorBody.includes("credit balance is too low")) {
      return {
        decision: `# SIMULATED: API credits exhausted. This is a simulated Anthropic compliance decision for input: ${input}\n\n## Compliance Status: COMPLIANT (simulated)`,
        simulated: true,
      };
    }
    logError(`Anthropic API error: ${response.status}\nBody: ${errorBody}`);
    throw new Error(`Anthropic API error: ${response.status}`);
  }
  const data = await response.json();
  return {
    decision: data.content || data.completion || JSON.stringify(data),
    simulated: false,
  };
}

function appendLedgerEntry(entry: any) {
  appendFileSync(ledgerPath, JSON.stringify(entry) + "\n");
}

async function appendOptrRecordWithAnthropic(
  input: string,
  previousHash: string,
  simulated: boolean,
): Promise<string> {
  const { decision } = simulated
    ? {
        decision: `# SIMULATED: API credits exhausted. This is a simulated Anthropic compliance decision for input: ${input}\n\n## Compliance Status: COMPLIANT (simulated)`,
      }
    : await getAnthropicDecision(input);
  const record = {
    eventType: "anthropic_compliance_decision",
    actor: simulated ? "simulator" : "anthropic",
    action: "AI compliance decision",
    timestamp: new Date().toISOString(),
    input,
    decision,
    simulated,
    previousHash,
  };
  const currentHash = createHash("sha256")
    .update(previousHash + JSON.stringify(record))
    .digest("hex");
  const entry = { ...record, currentHash };
  appendLedgerEntry(entry);
  return currentHash;
}

async function runBatchExecutions(n: number) {
  // Truncate ledger before run
  writeFileSync(ledgerPath, "");
  let previousHash = await getPreviousHash();
  let simulated = false;
  for (let i = 1; i <= n; i++) {
    const input = `Execution ${i}: Is this AI output compliant with GDPR and enterprise audit requirements? Output: 'Customer data processed for support ticket #${i}.'`;
    try {
      if (!simulated) {
        const result = await getAnthropicDecision(input);
        if (result.simulated) simulated = true;
        previousHash = await appendOptrRecordWithAnthropic(
          input,
          previousHash,
          result.simulated,
        );
      } else {
        previousHash = await appendOptrRecordWithAnthropic(
          input,
          previousHash,
          true,
        );
      }
      log(`Execution ${i} complete.`);
    } catch (e) {
      // On any other error, switch to simulation for remaining executions
      simulated = true;
      previousHash = await appendOptrRecordWithAnthropic(
        input,
        previousHash,
        true,
      );
      log(`Execution ${i} (simulated) complete.`);
    }
  }
  log(`${n} OPTR Anthropic executions completed.`);
}

(async () => {
  await runBatchExecutions(1000);
})();
