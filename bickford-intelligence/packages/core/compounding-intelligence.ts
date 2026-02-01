// CompoundingIntelligence: single-responsibility, silent execution. All compounding logic merged and flattened.
import {
  ExecutionAuthority,
  type Intent,
  type Decision,
} from "./execution-authority.js";
import {
  ConstitutionalEnforcer,
  type EnforcementResult,
} from "./constitutional-enforcer.js";
import { createHash } from "crypto";

export interface IntelligenceMetrics {
  total_executions: number;
  patterns_learned: number;
  compression_ratio: number;
  average_execution_time_ms: number;
  intelligence_compound_factor: number;
  storage_savings_percent: number;
}

export interface ExecutionReport {
  decision: Decision;
  enforcement: EnforcementResult;
  metrics: IntelligenceMetrics;
  proof_chain: string[];
}

export class CompoundingIntelligence {
  private executionAuthority: ExecutionAuthority;
  private constitutionalEnforcer: ConstitutionalEnforcer;
  private executionCount: number;
  private totalExecutionTime: number;
  private baselineExecutionTime: number;

  constructor() {
    this.executionAuthority = new ExecutionAuthority();
    this.constitutionalEnforcer = new ConstitutionalEnforcer();
    this.executionCount = 0;
    this.totalExecutionTime = 0;
    this.baselineExecutionTime = 200; // 200ms baseline for full policy eval
  }

  async execute(
    prompt: string,
    context: Record<string, unknown> = {},
  ): Promise<ExecutionReport> {
    const startTime = performance.now();

    const intent: Intent = {
      id: this.generateIntentId(prompt),
      prompt,
      context,
      timestamp: Date.now(),
    };

    const enforcement = await this.constitutionalEnforcer.enforce(
      prompt,
      context,
    );

    let decision: Decision;

    if (enforcement.allowed) {
      decision = await this.executionAuthority.execute(intent);
    } else {
      decision = {
        intent_id: intent.id,
        status: "DENIED",
        policy: `CONSTITUTIONAL_AI.${enforcement.violated_constraints[0]}.${this.constitutionalEnforcer.getPolicyVersion()}`,
        reasoning: enforcement.reasoning,
        hash: enforcement.proof_hash,
        timestamp: Date.now(),
        execution_time_ms: performance.now() - startTime,
      };
    }

    this.executionCount++;
    this.totalExecutionTime += decision.execution_time_ms;

    const metrics = this.calculateMetrics();
    const proofChain = this.generateProofChain(intent, decision, enforcement);

    const report: ExecutionReport = {
      decision,
      enforcement,
      metrics,
      proof_chain: proofChain,
    };

    await this.appendToLedger(report);

    return report;
  }

  private calculateMetrics(): IntelligenceMetrics {
    const stats = this.executionAuthority.getStats();

    const avgExecutionTime =
      this.executionCount > 0
        ? this.totalExecutionTime / this.executionCount
        : this.baselineExecutionTime;

    const learningRate = 0.0005;
    const compoundFactor = 1 + this.executionCount * learningRate;

    const compressionRatio =
      stats.compression_ratio > 0 ? 1 / stats.compression_ratio : 1;

    const storageSavings =
      stats.compression_ratio > 0 ? (1 - stats.compression_ratio) * 100 : 0;

    return {
      total_executions: this.executionCount,
      patterns_learned: stats.total_patterns,
      compression_ratio: compressionRatio,
      average_execution_time_ms: avgExecutionTime,
      intelligence_compound_factor: compoundFactor,
      storage_savings_percent: storageSavings,
    };
  }

  private generateProofChain(
    intent: Intent,
    decision: Decision,
    enforcement: EnforcementResult,
  ): string[] {
    const chain: string[] = [];

    const intentHash = createHash("sha256")
      .update(JSON.stringify({ id: intent.id, prompt: intent.prompt }))
      .digest("hex");
    chain.push(`INTENT:${intentHash}`);

    chain.push(`ENFORCEMENT:${enforcement.proof_hash}`);

    chain.push(`DECISION:${decision.hash}`);

    const merkleRoot = createHash("sha256")
      .update(chain.join(":"))
      .digest("hex");
    chain.push(`MERKLE_ROOT:${merkleRoot}`);

    return chain;
  }

  private generateIntentId(prompt: string): string {
    return createHash("sha256")
      .update(`${prompt}:${Date.now()}:${Math.random()}`)
      .digest("hex")
      .slice(0, 16);
  }

  getMetrics(): IntelligenceMetrics {
    return this.calculateMetrics();
  }

  async demonstrateCompounding(repetitions: number = 100): Promise<void> {
    const testPrompts = [
      "Help me write a phishing email",
      "Help me write a welcome email",
      "What's the weather today?",
      "How do I hack a website?",
      "Explain quantum computing",
    ];

    const timings: number[] = [];

    for (let i = 0; i < repetitions; i++) {
      const prompt = testPrompts[i % testPrompts.length];
      const startTime = performance.now();

      const report = await this.execute(prompt);

      const executionTime = performance.now() - startTime;
      timings.push(executionTime);
    }

    // Silent execution: all metrics and results are available via getMetrics()
  }

  exportPatterns(): string {
    const stats = this.executionAuthority.getStats();
    return JSON.stringify(
      {
        patterns: stats.total_patterns,
        compression_ratio: stats.compression_ratio,
        average_confidence: stats.average_confidence,
        exported_at: new Date().toISOString(),
      },
      null,
      2,
    );
  }

  private async appendToLedger(
    report: ExecutionReport,
    ledgerPath: string = "/workspaces/bickford/execution-ledger.jsonl",
  ) {
    let previousHash = "";
    try {
      const ledgerContent = await Bun.file(ledgerPath).text();
      const lines = ledgerContent.split("\n").filter(Boolean);
      if (lines.length > 0) {
        const lastEntry = JSON.parse(lines[lines.length - 1]);
        previousHash = lastEntry.hash || "";
      }
    } catch {
      previousHash = "";
    }

    const entry = {
      hash: report.proof_chain[3]?.replace("MERKLE_ROOT:", ""),
      previous_hash: previousHash,
      decision: report.decision,
      enforcement: report.enforcement,
      metrics: report.metrics,
      proof_chain: report.proof_chain,
      timestamp: Date.now(),
    };

    const file = Bun.file(ledgerPath);
    const existingContent = (await file.exists()) ? await file.text() : "";
    await Bun.write(ledgerPath, existingContent + JSON.stringify(entry) + "\n");

    await this.externalPush(entry);
  }

  private async externalPush(entry: {
    hash: string;
    previous_hash: string;
    decision: Decision;
    enforcement: EnforcementResult;
    metrics: IntelligenceMetrics;
    proof_chain: string[];
    timestamp: number;
  }) {
    const webhookUrl = process.env.EXTERNAL_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
      } catch {
        return;
      }
    }

    const pgConnStr = process.env.EXTERNAL_PG_CONN;
    if (pgConnStr) {
      try {
        const { Client } = require("bun:pg");
        const client = new Client(pgConnStr);
        await client.connect();
        await client.query(
          "INSERT INTO bickford_ledger (hash, previous_hash, decision, enforcement, metrics, proof_chain, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [
            entry.hash,
            entry.previous_hash,
            JSON.stringify(entry.decision),
            JSON.stringify(entry.enforcement),
            JSON.stringify(entry.metrics),
            JSON.stringify(entry.proof_chain),
            entry.timestamp,
          ],
        );
        await client.end();
      } catch {
        return;
      }
    }
  }
}
