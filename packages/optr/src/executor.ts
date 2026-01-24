import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { execSync } from "child_process";

export type AgentId = "codex" | "claude" | "copilot" | "ms-copilot";

export interface IntentContext {
  workflow: string;
  intent: string;
  constraints: string[];
  authority: string[];
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface AgentResult {
  agentId: AgentId;
  admissible: boolean;
  invariants: number;
  ttv: number;
  executionTimeMs: number;
  preference: number;
  output: string;
  evidence?: Record<string, unknown>;
}

export interface AgentRunners {
  runCodex: (context: IntentContext) => Promise<AgentResult>;
  runClaude: (context: IntentContext) => Promise<AgentResult>;
  runCopilot: (context: IntentContext) => Promise<AgentResult>;
  runMsCopilot: (context: IntentContext) => Promise<AgentResult>;
}

export interface OptrSelection {
  selected: AgentResult;
  scored: Array<AgentResult & { score: number }>;
}

export interface OptrExecutorResult {
  selection: OptrSelection;
  ledgerEntry: LedgerEntry;
  ledgerPath: string;
  workflowDir: string;
}

export interface LedgerEntry {
  workflow: string;
  intent: IntentContext;
  selectedAgent: AgentId;
  score: number;
  timestamp: string;
  prevHash: string;
  hash: string;
  gitCommit?: string;
  metadata?: Record<string, unknown>;
}

const WEIGHTS = {
  invariants: 0.4,
  ttv: 0.3,
  execution: 0.2,
  preference: 0.1,
} as const;

export async function optrExecutor(
  context: IntentContext,
  runners: AgentRunners
): Promise<OptrExecutorResult> {
  const start = Date.now();
  const [codex, claude, copilot, msCopilot] = await Promise.all([
    runners.runCodex(context),
    runners.runClaude(context),
    runners.runCopilot(context),
    runners.runMsCopilot(context),
  ]);

  const results = [codex, claude, copilot, msCopilot];
  const workflowDir = await persistWorkflow(context, results);
  const selection = canonicalSelectOptr(results);
  const ledgerPath = path.join("datalake", "ledger.jsonl");
  const ledgerEntry = await recordInLedger(
    ledgerPath,
    context,
    selection.selected,
    selection.scored.find((item) => item.agentId === selection.selected.agentId)
      ?.score ??
      0,
    { durationMs: Date.now() - start }
  );

  return {
    selection,
    ledgerEntry,
    ledgerPath,
    workflowDir,
  };
}

export function canonicalSelectOptr(results: AgentResult[]): OptrSelection {
  const scored = results.map((result) => ({
    ...result,
    score: scoreResult(result),
  }));
  const admissible = scored.filter((result) => result.admissible);

  if (admissible.length === 0) {
    throw new Error("No admissible agent results.");
  }

  const selected = admissible.reduce((best, current) =>
    current.score > best.score ? current : best
  );

  return {
    selected,
    scored,
  };
}

function scoreResult(result: AgentResult): number {
  const ttvScore = 1 / (1 + Math.max(0, result.ttv));
  const executionScore = 1 / (1 + Math.max(0, result.executionTimeMs));

  return (
    result.invariants * WEIGHTS.invariants +
    ttvScore * WEIGHTS.ttv +
    executionScore * WEIGHTS.execution +
    result.preference * WEIGHTS.preference
  );
}

async function persistWorkflow(
  context: IntentContext,
  results: AgentResult[]
): Promise<string> {
  const workflowDir = path.join("datalake", "workflows", context.workflow);
  await fs.mkdir(path.join(workflowDir, "agents"), { recursive: true });
  await fs.writeFile(
    path.join(workflowDir, "intent.json"),
    JSON.stringify(context, null, 2)
  );

  await Promise.all(
    results.map(async (result) => {
      const agentDir = path.join(workflowDir, "agents", result.agentId);
      await fs.mkdir(agentDir, { recursive: true });
      await fs.writeFile(
        path.join(agentDir, "result.json"),
        JSON.stringify(result, null, 2)
      );
    })
  );

  return workflowDir;
}

export async function recordInLedger(
  ledgerPath: string,
  intent: IntentContext,
  selection: AgentResult,
  score: number,
  metadata?: Record<string, unknown>
): Promise<LedgerEntry> {
  await fs.mkdir(path.dirname(ledgerPath), { recursive: true });
  const prevHash = await readPrevHash(ledgerPath);
  const entryBase = {
    workflow: intent.workflow,
    intent,
    selectedAgent: selection.agentId,
    score,
    timestamp: new Date().toISOString(),
    prevHash,
    metadata,
  };
  const hash = computeHash(`${prevHash}:${JSON.stringify(entryBase)}`);
  const entry: LedgerEntry = {
    workflow: intent.workflow,
    intent,
    selectedAgent: selection.agentId,
    score,
    timestamp: entryBase.timestamp,
    prevHash,
    hash,
    gitCommit: readGitCommit(),
    metadata,
  };

  await fs.appendFile(ledgerPath, `${JSON.stringify(entry)}\n`);
  return entry;
}

export async function verifyLedger(ledgerPath: string): Promise<boolean> {
  let prevHash = "GENESIS";
  const contents = await fs.readFile(ledgerPath, "utf8");
  const lines = contents.split("\n").filter(Boolean);

  for (const line of lines) {
    const entry = JSON.parse(line) as LedgerEntry;
    const base = {
      workflow: entry.workflow,
      intent: entry.intent,
      selectedAgent: entry.selectedAgent,
      score: entry.score,
      timestamp: entry.timestamp,
      prevHash,
      metadata: entry.metadata,
    };
    const expected = computeHash(`${prevHash}:${JSON.stringify(base)}`);
    if (entry.hash !== expected) {
      return false;
    }
    prevHash = entry.hash;
  }

  return true;
}

export function bindToGitHub(): string | undefined {
  return readGitCommit();
}

function computeHash(payload: string): string {
  return createHash("sha256").update(payload).digest("hex");
}

async function readPrevHash(ledgerPath: string): Promise<string> {
  try {
    const contents = await fs.readFile(ledgerPath, "utf8");
    const lines = contents.split("\n").filter(Boolean);
    if (lines.length === 0) {
      return "GENESIS";
    }
    const last = JSON.parse(lines[lines.length - 1]) as LedgerEntry;
    return last.hash;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return "GENESIS";
    }
    throw error;
  }
}

function readGitCommit(): string | undefined {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return undefined;
  }
}
// packages/optr/src/executor.ts
// OPTR Multi-Agent Executor (see canonical spec)
// (Full implementation as provided in user request)

/*
 * OPTR Multi-Agent Executor
 * Canonical orchestration layer for parallel agent execution:
 * - OpenAI Codex (code generation)
 * - Anthropic Claude (constitutional validation)
 * - GitHub Copilot (code execution)
 * - Microsoft Copilot/Stride (business workflows)
 *
 * Architecture:
 * Intent → Parallel Execution → Output Capture → OPTR Selection → Ledger → Execute π*
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { OpenAI } from "openai";
import { Octokit } from "@octokit/rest";
