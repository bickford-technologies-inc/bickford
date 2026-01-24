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
import optrExecutor, {
  createDefaultRunners,
  canonicalSelectOptr,
} from "../src/executor.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================================
// CLI Argument Parsing
// ============================================================================

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

// ============================================================================
// Configuration
// ============================================================================

function getConfig() {
  const datalakeRoot =
    process.env.DATALAKE_ROOT || path.join(process.cwd(), "datalake");
  const ledgerPath =
    process.env.LEDGER_PATH || path.join(datalakeRoot, "ledger.jsonl");

  return {
    datalakeRoot,
    ledgerPath,
    githubToken: process.env.GITHUB_TOKEN,
    openaiKey: process.env.OPENAI_API_KEY,
    anthropicKey: process.env.ANTHROPIC_API_KEY,
    repository: process.env.GITHUB_REPOSITORY
      ? {
          owner: process.env.GITHUB_REPOSITORY.split("/")[0],
          repo: process.env.GITHUB_REPOSITORY.split("/")[1],
        }
      : undefined,
  };
}

// ============================================================================
// Load or Create Intent Context
// ============================================================================

function getIntentContext(args) {
  // Option 1: Load from file
  if (args.context) {
    const content = fs.readFileSync(args.context, "utf-8");
    return JSON.parse(content);
  }

  // Option 2: Build from CLI args
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

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log("[OPTR CLI] Starting multi-agent executor...\n");

  try {
    // Parse arguments
    const args = parseArgs();
    const config = getConfig();
    const context = getIntentContext(args);

    // Display configuration
    console.log("[OPTR CLI] Configuration:");
    console.log(`  Datalake: ${config.datalakeRoot}`);
    console.log(`  Ledger: ${config.ledgerPath}`);
    console.log(
      `  GitHub: ${
        config.repository
          ? `${config.repository.owner}/${config.repository.repo}`
          : "not configured"
      }`,
    );
    console.log(`  OpenAI: ${config.openaiKey ? "configured" : "not configured"}`);
    console.log(
      `  Anthropic: ${config.anthropicKey ? "configured" : "not configured"}`,
    );
    console.log();

    console.log("[OPTR CLI] Intent Context:");
    console.log(`  Workflow: ${context.workflow}`);
    console.log(`  Intent: ${context.intent}`);
    console.log(`  Constraints: ${context.constraints.join(", ")}`);
    console.log();

    // Create agent runners
    const runners = createDefaultRunners(config);

    // Execute OPTR workflow
    console.log("[OPTR CLI] Executing parallel agent workflow...\n");
    console.log("=".repeat(80));
    console.log();

    const result = await optrExecutor(
      context,
      runners,
      canonicalSelectOptr,
      config,
    );

    console.log();
    console.log("=".repeat(80));
    console.log();
    console.log("[OPTR CLI] Execution complete!\n");

    // Display results
    console.log("[OPTR CLI] Selected Agent:");
    console.log(`  Agent: ${result.agent}`);
    console.log(`  Admissible: ${result.admissible}`);
    console.log(`  TTV Estimate: ${result.ttvEstimate}ms`);
    console.log(`  Invariants: ${result.invariants.join(", ")}`);
    console.log(`  Hash: ${result.hash}`);
    console.log();

    // Save result to file if specified
    if (args.output) {
      fs.writeFileSync(args.output, `${JSON.stringify(result, null, 2)}\n`);
      console.log(`[OPTR CLI] Result saved to: ${args.output}`);
    }

    // Exit with appropriate code
    process.exit(result.admissible ? 0 : 1);
  } catch (error) {
    console.error("[OPTR CLI] Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
// OPTR Multi-Agent Executor CLI (see canonical spec)
// (Full implementation as provided in user request)

// ...existing code from user request...
// (Full file content as provided in user request)
