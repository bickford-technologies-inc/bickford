/**
 * OPTR Multi-Agent Executor
 *
 * Canonical orchestration layer for parallel agent execution:
 * - OpenAI Codex (code generation)
 * - Claude (constitutional validation)
 * - GitHub Copilot (code execution)
 * - Microsoft Copilot/Stride (business workflows)
 *
 * Architecture:
 * Intent → Parallel Execution → Output Capture → OPTR Selection → Ledger → Execute π*
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

// ============================================================================
// Core Types (Canonical)
// ============================================================================

export type AgentResult = {
  agent: "codex" | "claude" | "copilot" | "mscopilot";
  output: unknown;
  admissible: boolean;
  ttvEstimate: number;
  invariants: string[];
  executionTime: number;
  hash: string;
  timestamp: number;
};

export type IntentContext = {
  workflow: string;
  intent: unknown;
  constraints: string[];
  metadata?: Record<string, unknown>;
};

export type LedgerEntry = {
  id: string;
  timestamp: number;
  workflow: string;
  intent: unknown;
  agentResults: AgentResult[];
  selectedOptr: AgentResult;
  commitHash?: string;
  previousHash: string;
  hash: string;
};

export type OPTRConfig = {
  datalakeRoot: string;
  ledgerPath: string;
  githubToken?: string;
  openaiKey?: string;
  anthropicKey?: string;
  repository?: {
    owner: string;
    repo: string;
  };
};

// ============================================================================
// Agent Runner Interface
// ============================================================================

export interface AgentRunners {
  runCodex: (ctx: IntentContext) => Promise<AgentResult>;
  runClaude: (ctx: IntentContext) => Promise<AgentResult>;
  runCopilot: (ctx: IntentContext) => Promise<AgentResult>;
  runMsCopilot: (ctx: IntentContext) => Promise<AgentResult>;
}

// ============================================================================
// OPTR Executor (Main Entry Point)
// ============================================================================

export async function optrExecutor(
  context: IntentContext,
  runners: AgentRunners,
  selectOptr: (results: AgentResult[], constraints: string[]) => AgentResult,
  config: OPTRConfig
): Promise<AgentResult> {
  console.log(`[OPTR] Starting workflow: ${context.workflow}`);
  console.log(`[OPTR] Intent:`, context.intent);
  console.log(`[OPTR] Constraints:`, context.constraints);

  // Step 1: Parallel agent execution
  console.log("[OPTR] Step 1: Executing agents in parallel...");
  const startTime = Date.now();

  const results = await Promise.all([
    runners.runCodex(context),
    runners.runClaude(context),
    runners.runCopilot(context),
    runners.runMsCopilot(context),
  ]);

  const totalTime = Date.now() - startTime;
  console.log(`[OPTR] All agents completed in ${totalTime}ms`);

  // Step 2: Output capture to datalake
  console.log("[OPTR] Step 2: Capturing outputs to datalake...");
  const workflowRoot = path.join(
    config.datalakeRoot,
    "workflows",
    context.workflow,
    "agent-outputs"
  );

  fs.mkdirSync(workflowRoot, { recursive: true });

  for (const result of results) {
    const outputPath = path.join(workflowRoot, `${result.agent}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`[OPTR] Captured ${result.agent} output: ${outputPath}`);
  }

  // Step 3: OPTR selection (admissibility + TTV + invariants)
  console.log("[OPTR] Step 3: Selecting optimal OPTR...");
  const optimal = selectOptr(results, context.constraints);
  console.log(
    `[OPTR] Selected: ${optimal.agent} (admissible: ${optimal.admissible}, TTV: ${optimal.ttvEstimate}ms)`
  );

  const selectionPath = path.join(
    config.datalakeRoot,
    "workflows",
    context.workflow,
    "optr-selection.json"
  );
  fs.writeFileSync(selectionPath, JSON.stringify(optimal, null, 2));

  // Step 4: Ledger binding
  console.log("[OPTR] Step 4: Recording decision in ledger...");
  await recordInLedger(context, results, optimal, config);

  // Step 5: Return π* (selected OPTR)
  console.log("[OPTR] Workflow complete.");
  return optimal;
}

// ============================================================================
// Default Selection (Canonical Scoring)
// ============================================================================

export function canonicalSelectOptr(
  results: AgentResult[],
  _constraints: string[]
): AgentResult {
  const admissible = results.filter((result) => result.admissible);
  const candidates = admissible.length > 0 ? admissible : results;

  const scored = candidates.map((result) => ({
    result,
    score: scoreResult(result),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.result ?? results[0];
}

function scoreResult(result: AgentResult): number {
  const invariantScore = result.invariants.length * 40;
  const ttvScore = Math.max(0, 30 - (result.ttvEstimate / 1000) * 3);
  const execScore = Math.max(0, 20 - (result.executionTime / 100) * 2);
  const admissibleScore = result.admissible ? 10 : 0;

  return invariantScore + ttvScore + execScore + admissibleScore;
}

// ============================================================================
// Ledger Recording
// ============================================================================

async function recordInLedger(
  context: IntentContext,
  results: AgentResult[],
  selected: AgentResult,
  config: OPTRConfig
): Promise<LedgerEntry> {
  const previousHash = readPreviousHash(config.ledgerPath);
  const entry: LedgerEntry = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    workflow: context.workflow,
    intent: context.intent,
    agentResults: results,
    selectedOptr: selected,
    previousHash,
    hash: "",
  };

  entry.hash = hashEntry(entry);
  appendLedgerEntry(config.ledgerPath, entry);
  return entry;
}

function readPreviousHash(ledgerPath: string): string {
  if (!fs.existsSync(ledgerPath)) {
    return "";
  }

  const lines = fs.readFileSync(ledgerPath, "utf8").trim().split("\n");
  const lastLine = lines.at(-1);
  if (!lastLine) return "";

  try {
    const parsed = JSON.parse(lastLine) as LedgerEntry;
    return parsed.hash || "";
  } catch {
    return "";
  }
}

function hashEntry(entry: LedgerEntry): string {
  const data = JSON.stringify({
    id: entry.id,
    timestamp: entry.timestamp,
    workflow: entry.workflow,
    intent: entry.intent,
    agentResults: entry.agentResults,
    selectedOptr: entry.selectedOptr,
    previousHash: entry.previousHash,
  });

  return crypto.createHash("sha256").update(data).digest("hex");
}

function appendLedgerEntry(ledgerPath: string, entry: LedgerEntry): void {
  const dir = path.dirname(ledgerPath);
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(ledgerPath, `${JSON.stringify(entry)}\n`);
}

// ============================================================================
// Runner Factory (Requires External Integration)
// ============================================================================

export function createDefaultRunners(): AgentRunners {
  const missing = async (agent: AgentResult["agent"]) => {
    return {
      agent,
      output: {
        error: "No runner configured. Provide integration-specific runners.",
      },
      admissible: false,
      ttvEstimate: Number.POSITIVE_INFINITY,
      invariants: [],
      executionTime: 0,
      hash: crypto.createHash("sha256").update(agent).digest("hex"),
      timestamp: Date.now(),
    } satisfies AgentResult;
  };

  return {
    runCodex: async () => missing("codex"),
    runClaude: async () => missing("claude"),
    runCopilot: async () => missing("copilot"),
    runMsCopilot: async () => missing("mscopilot"),
  };
}

export default optrExecutor;
