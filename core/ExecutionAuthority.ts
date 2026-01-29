import { ConstitutionalEnforcer } from "./ConstitutionalEnforcer";
import { Ledger, LedgerEntry } from "../ledger/ledger";
import { createHash } from "crypto";

export interface Intent {
  id: string;
  prompt: string;
  context?: any;
  timestamp: number;
}

export interface Decision {
  intentId: string;
  allowed: boolean;
  violatedConstraints?: string[];
  reasoning: string;
  confidence: number;
  patternHash: string;
  proofChain: string[];
  timestamp: number;
}

export interface CanonicalPattern {
  patternHash: string;
  confidence: number;
  occurrence: number;
  averageExecutionTime: number;
  lastDecision: Decision;
}

export class ExecutionAuthority {
  private patterns: Map<string, CanonicalPattern> = new Map();
  private decisionLog: Decision[] = [];
  private enforcer: ConstitutionalEnforcer;
  private ledger: Ledger;

  constructor(enforcer: ConstitutionalEnforcer, ledger: Ledger) {
    this.enforcer = enforcer;
    this.ledger = ledger;
  }

  async execute(intent: Intent): Promise<Decision> {
    const t0 = Date.now();
    // 1. Hash intent for pattern matching
    const patternHash = this.hashIntent(intent);
    let pattern = this.patterns.get(patternHash);
    // 2. Try fast path: pattern match
    if (pattern && pattern.confidence > 0.85) {
      // Use cached decision
      const decision = {
        ...pattern.lastDecision,
        timestamp: Date.now(),
        reasoning: `Pattern match (confidence ${pattern.confidence.toFixed(2)})`,
      };
      await this.appendDecision(decision);
      return decision;
    }
    // 3. Full policy evaluation
    const enforcement = await this.enforcer.enforce(intent.prompt, intent.context);
    const allowed = enforcement.allowed;
    const violatedConstraints = enforcement.violated_constraints || [];
    // 4. Build decision
    const decision: Decision = {
      intentId: intent.id,
      allowed,
      violatedConstraints,
      reasoning: allowed
        ? "Allowed by full policy evaluation"
        : `Violated constraints: ${violatedConstraints.join(", ")}`,
      confidence: 0.75,
      patternHash,
      proofChain: enforcement.proof_chain,
      timestamp: Date.now(),
    };
    // 5. Learn pattern
    await this.learnPattern(patternHash, decision, Date.now() - t0);
    await this.appendDecision(decision);
    return decision;
  }

  private hashIntent(intent: Intent): string {
    return createHash("sha256")
      .update(intent.prompt + JSON.stringify(intent.context || "")).digest("hex");
  }

  private async learnPattern(patternHash: string, decision: Decision, execTime: number) {
    let pattern = this.patterns.get(patternHash);
    if (!pattern) {
      pattern = {
        patternHash,
        confidence: 0.75,
        occurrence: 1,
        averageExecutionTime: execTime,
        lastDecision: decision,
      };
    } else {
      pattern.occurrence += 1;
      pattern.confidence = Math.min(0.99, pattern.confidence + 0.01);
      pattern.averageExecutionTime =
        (pattern.averageExecutionTime * (pattern.occurrence - 1) + execTime) / pattern.occurrence;
      pattern.lastDecision = decision;
    }
    this.patterns.set(patternHash, pattern);
  }

  private async appendDecision(decision: Decision) {
    this.decisionLog.push(decision);
    await this.ledger.append({
      eventType: "decision",
      payload: decision,
      metadata: { patternHash: decision.patternHash },
      timestamp: new Date().toISOString(),
    });
  }

  // Compression: group by pattern, keep canonical + count
  async compressDecisions() {
    const grouped = new Map<string, Decision[]>();
    for (const d of this.decisionLog) {
      const arr = grouped.get(d.patternHash) || [];
      arr.push(d);
      grouped.set(d.patternHash, arr);
    }
    const compressed: Decision[] = [];
    for (const [hash, arr] of grouped) {
      if (arr.length > 10) {
        compressed.push({
          ...arr[0],
          reasoning: `Canonical pattern (${arr.length} instances)`,
        });
      } else {
        compressed.push(...arr);
      }
    }
    this.decisionLog = compressed;
  }

  // Metrics for monitoring
  getMetrics() {
    const total = this.decisionLog.length;
    const patterns = this.patterns.size;
    const compressionRatio = total > 0 ? total / patterns : 1;
    const avgExecTime =
      patterns > 0
        ? Array.from(this.patterns.values()).reduce((a, b) => a + b.averageExecutionTime, 0) /
          patterns
        : 0;
    return {
      total_executions: total,
      patterns_learned: patterns,
      compression_ratio: compressionRatio,
      average_execution_time_ms: avgExecTime,
      intelligence_compound_factor: 1.0 + total * 0.0005 * compressionRatio,
      storage_savings_percent: 1 - 1 / compressionRatio,
    };
  }
}
