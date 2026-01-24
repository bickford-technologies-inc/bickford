import { readFile, writeFile } from "fs/promises";
import { optrExecutor } from "../dist/executor.js";

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      continue;
    }
    const key = arg.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "";
    args[key] = value;
  }
  return args;
}

function buildContext(args) {
  const timestamp = new Date().toISOString();
  if (args.context) {
    return readFile(args.context, "utf8").then((data) => JSON.parse(data));
  }
  return Promise.resolve({
    workflow: args.workflow ?? "optr-workflow",
    intent: args.intent ?? "",
    constraints: args.constraints ? args.constraints.split(",") : [],
    authority: args.authority ? args.authority.split(",") : [],
    timestamp,
  });
}

function buildRunner(agentId, offset) {
  return async (context) => {
    const ttvBase = Math.max(1, context.intent.length / 10);
    const executionTimeMs = 500 + offset * 200;
    return {
      agentId,
      admissible: true,
      invariants: 0.9 - offset * 0.05,
      ttv: ttvBase + offset,
      executionTimeMs,
      preference: 0.5 + offset * 0.1,
      output: `${agentId} completed: ${context.intent}`,
      evidence: {
        constraints: context.constraints,
      },
    };
  };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const context = await buildContext(args);
  const result = await optrExecutor(context, {
    runCodex: buildRunner("codex", 0),
    runClaude: buildRunner("claude", 1),
    runCopilot: buildRunner("copilot", 2),
    runMsCopilot: buildRunner("ms-copilot", 3),
  });

  const output = {
    selection: result.selection,
    ledger: result.ledgerEntry,
  };

  if (args.output) {
    await writeFile(args.output, JSON.stringify(output, null, 2));
  } else {
    console.log(JSON.stringify(output, null, 2));
  }
}

run();
#!/usr/bin/env node
// packages/optr/cli/execute.js
// OPTR Multi-Agent Executor CLI (see canonical spec)
// (Full implementation as provided in user request)

// ...existing code from user request...
// (Full file content as provided in user request)
