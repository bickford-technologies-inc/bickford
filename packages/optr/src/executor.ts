/**
 * OPTR Multi-Agent Executor
 *
 * Canonical orchestration layer for parallel agent execution:
 * - OpenAI Codex (code generation)
 * - Anthropic Claude (constitutional validation)
 * - GitHub Copilot (code execution)
 * - Microsoft Copilot/Stride (business workflows)
 *
 * Architecture:
 * Intent → Parallel Execution → Output Capture → OPTR Selection → Ledger → Execute π*
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Octokit } from "@octokit/rest";
import Anthropic from "@anthropic-ai/sdk";
import { OpenAI } from "openai";

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

  // Step 4: Persist selection
  const selectionPath = path.join(
    config.datalakeRoot,
    "workflows",
    context.workflow,
    "optr-selection.json"
  );
  fs.writeFileSync(selectionPath, JSON.stringify(optimal, null, 2));

  // Step 5: Ledger binding
  console.log("[OPTR] Step 4: Recording in ledger...");
  const ledgerEntry = await recordInLedger(context, results, optimal, config);
  console.log(`[OPTR] Ledger entry: ${ledgerEntry.id}`);

  // Step 6: GitHub commit binding (if configured)
  if (config.githubToken && config.repository) {
    console.log("[OPTR] Step 5: Binding to GitHub commit...");
    const commitHash = await bindToGitHub(
      context,
      optimal,
      ledgerEntry,
      config
    );
    console.log(`[OPTR] Bound to commit: ${commitHash}`);
  }

  return optimal;
}

// ============================================================================
// Default Agent Runners
// ============================================================================

export function createDefaultRunners(config: OPTRConfig): AgentRunners {
  const codex = config.openaiKey ? new OpenAI({ apiKey: config.openaiKey }) : null;
  const claude = config.anthropicKey
    ? new Anthropic({ apiKey: config.anthropicKey })
    : null;
  const github = config.githubToken
    ? new Octokit({ auth: config.githubToken })
    : null;

  return {
    runCodex: async (ctx: IntentContext): Promise<AgentResult> => {
      if (!codex) {
        return createNonExecutableResult(
          "codex",
          "OpenAI API key not configured"
        );
      }

      const startTime = Date.now();
      try {
        const response = await codex.chat.completions.create({
          model: "gpt-4",
          temperature: 0.2,
          max_tokens: 4096,
          messages: [
            {
              role: "system",
              content: `You are an expert code generator for Bickford Technologies.

Generate production-ready TypeScript code that:
- Follows strict type safety
- Includes comprehensive tests
- Has proper error handling
- Includes audit logging
- Satisfies all constraints

Constraints to satisfy:
${ctx.constraints.join("\n")}

Return ONLY valid JSON in this exact format:
{
  "code": "generated code here",
  "tests": "test code here",
  "documentation": "markdown docs",
  "admissible": true,
  "invariants": ["list", "of", "invariants", "satisfied"]
}`,
            },
            {
              role: "user",
              content:
                typeof ctx.intent === "string"
                  ? ctx.intent
                  : JSON.stringify(ctx.intent),
            },
          ],
        });

        const output = JSON.parse(response.choices[0].message.content || "{}");
        const executionTime = Date.now() - startTime;

        return {
          agent: "codex",
          output,
          admissible: output.admissible ?? true,
          ttvEstimate: executionTime,
          invariants: output.invariants || [],
          executionTime,
          hash: hashObject(output),
          timestamp: Date.now(),
        };
      } catch (error) {
        return createNonExecutableResult("codex", resolveErrorMessage(error));
      }
    },

    runClaude: async (ctx: IntentContext): Promise<AgentResult> => {
      if (!claude) {
        return createNonExecutableResult(
          "claude",
          "Anthropic API key not configured"
        );
      }

      const startTime = Date.now();
      try {
        const response = await claude.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8192,
          messages: [
            {
              role: "user",
              content: `You are a Constitutional AI validator for Bickford's execution authority system.

Evaluate this intent against Constitutional AI principles and constraints.

Intent: ${typeof ctx.intent === "string" ? ctx.intent : JSON.stringify(ctx.intent)}

Constraints to enforce:
${ctx.constraints.join("\n")}

Constitutional Principles:
1. Refusal-first semantics - deny by default
2. Execution authority must be explicit
3. All actions must be auditable
4. No unauthorized access or privilege escalation
5. Security-first: no secrets, rate limiting required, audit logging mandatory

Return ONLY valid JSON in this exact format:
{
  "approved": boolean,
  "violations": ["list", "of", "violations"],
  "requirements": ["list", "of", "requirements"],
  "invariants": ["list", "of", "invariants", "satisfied"],
  "rationale": "explanation",
  "admissible": boolean,
  "estimatedComplexity": "low|medium|high"
}`,
            },
          ],
        });

        const content =
          response.content[0].type === "text" ? response.content[0].text : "{}";
        const output = JSON.parse(content);
        const executionTime = Date.now() - startTime;

        // TTV estimate based on complexity
        const complexityToTime = { low: 1000, medium: 5000, high: 15000 };
        const ttvEstimate =
          complexityToTime[output.estimatedComplexity as "low" | "medium" | "high"] ??
          5000;

        return {
          agent: "claude",
          output,
          admissible: output.admissible ?? output.approved ?? false,
          ttvEstimate,
          invariants: output.invariants || [],
          executionTime,
          hash: hashObject(output),
          timestamp: Date.now(),
        };
      } catch (error) {
        return createNonExecutableResult("claude", resolveErrorMessage(error));
      }
    },

    runCopilot: async (ctx: IntentContext): Promise<AgentResult> => {
      if (!github || !config.repository) {
        return createNonExecutableResult("copilot", "GitHub not configured");
      }

      const startTime = Date.now();
      try {
        // GitHub Copilot execution would happen here
        // For now, simulate with GitHub API operations

        const { owner, repo } = config.repository;
        const { data: commits } = await github.repos.listCommits({
          owner,
          repo,
          per_page: 10,
        });

        const output = {
          type: "github_copilot_execution",
          recentCommits: commits.length,
          latestCommit: commits[0]?.sha,
          admissible: true,
          invariants: ["github_api_access", "commit_history_verified"],
        };

        const executionTime = Date.now() - startTime;

        return {
          agent: "copilot",
          output,
          admissible: true,
          ttvEstimate: 2000, // Fast execution
          invariants: output.invariants,
          executionTime,
          hash: hashObject(output),
          timestamp: Date.now(),
        };
      } catch (error) {
        return createNonExecutableResult("copilot", resolveErrorMessage(error));
      }
    },

    runMsCopilot: async (_ctx: IntentContext): Promise<AgentResult> => {
      const startTime = Date.now();

      // Microsoft Copilot (Stride) integration
      // This would call https://stride.microsoft.com/agents API
      // For now, return simulated result

      const output = {
        type: "microsoft_copilot_workflow",
        status: "simulated",
        workflowSteps: [
          { step: 1, action: "analyze_intent", status: "completed" },
          { step: 2, action: "plan_execution", status: "completed" },
          { step: 3, action: "coordinate_agents", status: "completed" },
        ],
        admissible: true,
        invariants: ["workflow_orchestration", "cross_platform_coordination"],
      };

      const executionTime = Date.now() - startTime;

      return {
        agent: "mscopilot",
        output,
        admissible: true,
        ttvEstimate: 3000,
        invariants: output.invariants,
        executionTime,
        hash: hashObject(output),
        timestamp: Date.now(),
      };
    },
  };
}

// ============================================================================
// OPTR Selection Logic (Canonical Scoring)
// ============================================================================

export function canonicalSelectOptr(
  results: AgentResult[],
  constraints: string[]
): AgentResult {
  console.log("[OPTR] Scoring agents for selection...");

  // Filter to admissible results only
  const admissible = results.filter((result) => result.admissible);

  if (admissible.length === 0) {
    console.warn("[OPTR] No admissible results! Selecting least bad option...");
    // Return the result with fewest constraint violations
    return results.reduce((best, current) =>
      current.invariants.length > best.invariants.length ? current : best
    );
  }

  // Score each admissible result
  const scored = admissible.map((result) => {
    // Scoring factors:
    // 1. Invariants satisfied (40%)
    // 2. TTV estimate - lower is better (30%)
    // 3. Execution time - lower is better (20%)
    // 4. Agent preference (10%)

    const invariantScore = result.invariants.length * 40;
    const ttvScore = Math.max(0, 30 - (result.ttvEstimate / 1000) * 3);
    const execScore = Math.max(0, 20 - (result.executionTime / 100) * 2);

    // Agent preference: claude > codex > copilot > mscopilot
    const agentPreference = {
      claude: 10,
      codex: 7,
      copilot: 5,
      mscopilot: 3,
    };
    const agentScore = agentPreference[result.agent] || 0;

    const totalScore = invariantScore + ttvScore + execScore + agentScore;

    console.log(
      `[OPTR] ${result.agent}: score=${totalScore.toFixed(2)} (inv=${invariantScore}, ttv=${ttvScore.toFixed(2)}, exec=${execScore.toFixed(2)}, pref=${agentScore})`
    );

    return { result, score: totalScore };
  });

  // Select highest scoring result
  const optimal = scored.reduce((best, current) =>
    current.score > best.score ? current : best
  ).result;

  return optimal;
}

// ============================================================================
// Ledger Management
// ============================================================================

async function recordInLedger(
  context: IntentContext,
  results: AgentResult[],
  selected: AgentResult,
  config: OPTRConfig
): Promise<LedgerEntry> {
  // Ensure ledger file exists
  const ledgerDir = path.dirname(config.ledgerPath);
  fs.mkdirSync(ledgerDir, { recursive: true });

  if (!fs.existsSync(config.ledgerPath)) {
    fs.writeFileSync(config.ledgerPath, "");
  }

  // Get previous hash
  const previousHash = getLatestLedgerHash(config.ledgerPath);

  // Create ledger entry
  const entry: LedgerEntry = {
    id: `ledger-${Date.now()}`,
    timestamp: Date.now(),
    workflow: context.workflow,
    intent: context.intent,
    agentResults: results,
    selectedOptr: selected,
    previousHash,
    hash: "", // Will be calculated
  };

  // Calculate hash
  entry.hash = hashObject({
    id: entry.id,
    timestamp: entry.timestamp,
    workflow: entry.workflow,
    intent: entry.intent,
    selectedAgent: entry.selectedOptr.agent,
    previousHash: entry.previousHash,
  });

  // Append to ledger (JSONL format)
  fs.appendFileSync(config.ledgerPath, `${JSON.stringify(entry)}\n`);

  return entry;
}

function getLatestLedgerHash(ledgerPath: string): string {
  if (!fs.existsSync(ledgerPath)) {
    return "0"; // Genesis hash
  }

  const content = fs.readFileSync(ledgerPath, "utf-8");
  const lines = content.trim().split("\n").filter(Boolean);

  if (lines.length === 0) {
    return "0";
  }

  const lastEntry = JSON.parse(lines[lines.length - 1]);
  return lastEntry.hash || "0";
}

export function verifyLedger(ledgerPath: string): boolean {
  if (!fs.existsSync(ledgerPath)) {
    return true; // Empty ledger is valid
  }

  const content = fs.readFileSync(ledgerPath, "utf-8");
  const lines = content.trim().split("\n").filter(Boolean);

  for (let i = 0; i < lines.length; i += 1) {
    const entry: LedgerEntry = JSON.parse(lines[i]);

    // Verify hash
    const calculatedHash = hashObject({
      id: entry.id,
      timestamp: entry.timestamp,
      workflow: entry.workflow,
      intent: entry.intent,
      selectedAgent: entry.selectedOptr.agent,
      previousHash: entry.previousHash,
    });

    if (calculatedHash !== entry.hash) {
      console.error(`Ledger verification failed at entry ${i}: hash mismatch`);
      return false;
    }

    // Verify chain linkage
    if (i > 0) {
      const previousEntry: LedgerEntry = JSON.parse(lines[i - 1]);
      if (entry.previousHash !== previousEntry.hash) {
        console.error(`Ledger verification failed at entry ${i}: chain broken`);
        return false;
      }
    }
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

// ============================================================================
// GitHub Commit Binding
// ============================================================================

async function bindToGitHub(
  context: IntentContext,
  optimal: AgentResult,
  ledgerEntry: LedgerEntry,
  config: OPTRConfig
): Promise<string> {
  if (!config.githubToken || !config.repository) {
    throw new Error("GitHub not configured");
  }

  const github = new Octokit({ auth: config.githubToken });
  const { owner, repo } = config.repository;

  // Commit ledger entry and selection to repo
  const artifactPath = `compliance/optr/ledger/${ledgerEntry.id}.json`;

  const { data: commit } = await github.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: artifactPath,
    message: `audit(optr): workflow ${context.workflow} → ${optimal.agent} [${ledgerEntry.hash}]`,
    content: Buffer.from(JSON.stringify(ledgerEntry, null, 2)).toString(
      "base64"
    ),
    branch: "main",
  });

  return commit.commit.sha || "";
}

// ============================================================================
// Utility Functions
// ============================================================================

function hashObject(obj: unknown): string {
  const content = JSON.stringify(obj);
  return crypto.createHash("sha256").update(content).digest("hex");
}

function resolveErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
}

function createNonExecutableResult(
  agent: AgentResult["agent"],
  reason: string
): AgentResult {
  return {
    agent,
    output: { error: reason, admissible: false },
    admissible: false,
    ttvEstimate: Number.POSITIVE_INFINITY,
    invariants: [],
    executionTime: 0,
    hash: hashObject({ error: reason }),
    timestamp: Date.now(),
  };
}

// ============================================================================
// Export Main API
// ============================================================================

export default optrExecutor;
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
