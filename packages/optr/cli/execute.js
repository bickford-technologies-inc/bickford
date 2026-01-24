#!/usr/bin/env node
// packages/optr/cli/execute.js
/**
 * OPTR Multi-Agent Executor CLI
 *
 * Usage:
 *   node execute.js --context context.json --output result.json
 *   node execute.js --workflow "my-workflow" --intent "Implement auth" --constraints "security,audit"
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  optrExecutor,
  createDefaultRunners,
  canonicalSelectOptr,
} from "../dist/executor.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, "");
    const value = args[i + 1];
    parsed[key] = value;
  }

  return parsed;
}

function getConfig() {
  const datalakeRoot =
    process.env.DATALAKE_ROOT || path.join(process.cwd(), "datalake");
  const ledgerPath =
    process.env.LEDGER_PATH || path.join(datalakeRoot, "ledger.jsonl");

  return {
    datalakeRoot,
    ledgerPath,
  };
}

function getIntentContext(args) {
  if (args.context) {
    const content = fs.readFileSync(args.context, "utf-8");
    return JSON.parse(content);
  }

  if (args.workflow && args.intent) {
    const constraints = args.constraints
      ? args.constraints.split(",").map((value) => value.trim())
      : [];

    return {
      workflow: args.workflow,
      intent: args.intent,
      constraints,
      metadata: {
        source: "cli",
        timestamp: Date.now(),
      },
    };
  }

  throw new Error("Must provide either --context <file> or --workflow + --intent");
}

async function main() {
  const args = parseArgs();
  const config = getConfig();
  const context = getIntentContext(args);

  console.log("[OPTR CLI] Starting multi-agent executor...");
  console.log(`[OPTR CLI] Workflow: ${context.workflow}`);
  console.log(`[OPTR CLI] Intent: ${context.intent}`);

  const selection = await optrExecutor(
    context,
    createDefaultRunners(),
    canonicalSelectOptr,
    config
  );

  const output = {
    selection,
  };

  if (args.output) {
    fs.writeFileSync(args.output, JSON.stringify(output, null, 2));
    console.log(`[OPTR CLI] Output written to ${args.output}`);
  } else {
    console.log(JSON.stringify(output, null, 2));
  }
}

main().catch((error) => {
  console.error("[OPTR CLI] Execution failed:", error);
  process.exit(1);
});
