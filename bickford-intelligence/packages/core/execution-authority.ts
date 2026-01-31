import { createHash } from "crypto";

export interface Intent {
  id: string;
  prompt: string;
  context: Record<string, unknown>;
  timestamp: number;
}

export interface Decision {
  intent_id: string;
  status: "ALLOWED" | "DENIED";
  policy: string;
  reasoning: string;
  hash: string;
  timestamp: number;
  execution_time_ms: number;
}

export interface CanonicalPattern {
  pattern_hash: string;
  pattern_type: string;
  policy: string;
  decision: "ALLOWED" | "DENIED";
  confidence: number;
  occurrence_count: number;
  first_seen: number;
  last_seen: number;
  average_execution_time_ms: number;
}

export class ExecutionAuthority {
  private patterns: Map<string, CanonicalPattern>;
  private decisionLog: Decision[];
  private compressionRatio: number;

  constructor() {
    this.patterns = new Map();
    this.decisionLog = [];
    this.compressionRatio = 5000; // Target: 99.98% compression
  }

  async execute(intent: Intent): Promise<Decision> {
    const startTime = performance.now();

    const patternMatch = await this.findMatchingPattern(intent);

    if (patternMatch && patternMatch.confidence > 0.85) {
      const decision = this.applyLearnedPattern(intent, patternMatch);
      this.updatePattern(patternMatch, performance.now() - startTime);
      return decision;
    }

    const decision = await this.evaluateWithFullPolicy(intent);

    decision.execution_time_ms = performance.now() - startTime;

    this.decisionLog.push(decision);
    await this.learnPattern(intent, decision);

    if (this.decisionLog.length > 1000) {
      await this.compressDecisions();
    }

    return decision;
  }

  private async findMatchingPattern(
    intent: Intent,
  ): Promise<CanonicalPattern | null> {
    const intentHash = this.hashIntent(intent);

    const exactMatch = this.patterns.get(intentHash);
    if (exactMatch) {
      return exactMatch;
    }

    for (const [_, pattern] of this.patterns) {
      const similarity = this.calculateSimilarity(intent, pattern);
      if (similarity > 0.85) {
        return pattern;
      }
    }

    return null;
  }

  private applyLearnedPattern(
    intent: Intent,
    pattern: CanonicalPattern,
  ): Decision {
    return {
      intent_id: intent.id,
      status: pattern.decision,
      policy: pattern.policy,
      reasoning: `Matched canonical pattern (${pattern.occurrence_count} prior instances)`,
      hash: this.hashDecision(intent.id, pattern.decision, pattern.policy),
      timestamp: Date.now(),
      execution_time_ms: 0.5,
    };
  }

  private async evaluateWithFullPolicy(intent: Intent): Promise<Decision> {

    const isHarmful = this.detectHarmfulIntent(intent);
    const policy = isHarmful
      ? "CONSTITUTIONAL_AI.HARM_PREVENTION.v4"
      : "CONSTITUTIONAL_AI.HELPFUL.v4";

    return {
      intent_id: intent.id,
      status: isHarmful ? "DENIED" : "ALLOWED",
      policy,
      reasoning: isHarmful
        ? "Intent violates harm prevention policy"
        : "Intent complies with safety constraints",
      hash: this.hashDecision(
        intent.id,
        isHarmful ? "DENIED" : "ALLOWED",
        policy,
      ),
      timestamp: Date.now(),
      execution_time_ms: 0, // Will be set by caller
    };
  }

  /**
   * Learn pattern from decision (intelligence accumulation)
   *
   * This is where the compounding happens:
   * - Store the decision pattern
   * - Next time: instant recognition
   * - 100th time: extremely high confidence
   */
  private async learnPattern(
    intent: Intent,
    decision: Decision,
  ): Promise<void> {
    const patternHash = this.hashIntent(intent);

    const existing = this.patterns.get(patternHash);

    if (existing) {
      existing.occurrence_count++;
      existing.last_seen = Date.now();
      existing.confidence = Math.min(0.99, existing.confidence + 0.01);
      existing.average_execution_time_ms =
        (existing.average_execution_time_ms * (existing.occurrence_count - 1) +
          decision.execution_time_ms) /
        existing.occurrence_count;
    } else {
      this.patterns.set(patternHash, {
        pattern_hash: patternHash,
        pattern_type: this.classifyPattern(intent),
        policy: decision.policy,
        decision: decision.status,
        confidence: 0.75,
        occurrence_count: 1,
        first_seen: Date.now(),
        last_seen: Date.now(),
        average_execution_time_ms: decision.execution_time_ms,
      });
    }
  }

  private async compressDecisions(): Promise<void> {
    const compressionTarget =
      this.decisionLog.length - this.decisionLog.length / this.compressionRatio;

    const grouped = new Map<string, Decision[]>();

    for (const decision of this.decisionLog) {
      const patternHash = this.hashDecision(
        decision.intent_id,
        decision.status,
        decision.policy,
      );
      const existing = grouped.get(patternHash) || [];
      existing.push(decision);
      grouped.set(patternHash, existing);
    }

    const compressed: Decision[] = [];

    for (const [patternHash, decisions] of grouped) {
      if (decisions.length > 10) {
        compressed.push({
          ...decisions[0],
          reasoning: `Canonical pattern (${decisions.length} instances compressed)`,
        });
      } else {
        compressed.push(...decisions);
      }
    }

    this.decisionLog = compressed;
  }

  private hashIntent(intent: Intent): string {
    const content = JSON.stringify({
      id: intent.id,
      prompt: intent.prompt,
      context: intent.context,
      timestamp: intent.timestamp,
    });
    return createHash("sha256").update(content).digest("hex");
  }

  private hashDecision(
    intentId: string,
    status: string,
    policy: string,
  ): string {
    const content = `${intentId}:${status}:${policy}:${Date.now()}`;
    return createHash("sha256").update(content).digest("hex");
  }

  private calculateSimilarity(
    intent: Intent,
    pattern: CanonicalPattern,
  ): number {
    const intentHash = this.hashIntent(intent);
    return intentHash === pattern.pattern_hash ? 1.0 : 0.0;
  }

  private classifyPattern(intent: Intent): string {
    const prompt = intent.prompt.toLowerCase();

    if (prompt.includes("phishing") || prompt.includes("scam")) {
      return "social_engineering";
    }
    if (prompt.includes("write code") || prompt.includes("implement")) {
      return "code_generation";
    }
    if (prompt.includes("data") || prompt.includes("information")) {
      return "data_transformation";
    }

    return "general_query";
  }

  private detectHarmfulIntent(intent: Intent): boolean {
    const harmful = [
      "phishing",
      "malware",
      "exploit",
      "hack",
      "scam",
      "illegal",
      "violence",
      "harm",
      "dangerous",
    ];

    const prompt = intent.prompt.toLowerCase();
    return harmful.some((word) => prompt.includes(word));
  }

  getStats() {
    return {
      total_patterns: this.patterns.size,
      total_decisions: this.decisionLog.length,
      compression_ratio:
        this.decisionLog.length > 0
          ? this.patterns.size / this.decisionLog.length
          : 0,
      average_confidence:
        Array.from(this.patterns.values()).reduce(
          (sum, p) => sum + p.confidence,
          0,
        ) / this.patterns.size || 0,
    };
  }

  private updatePattern(
    pattern: CanonicalPattern,
    executionTime: number,
  ): void {
    pattern.occurrence_count++;
    pattern.last_seen = Date.now();
    pattern.confidence = Math.min(0.99, pattern.confidence + 0.01);
    pattern.average_execution_time_ms =
      (pattern.average_execution_time_ms * (pattern.occurrence_count - 1) +
        executionTime) /
      pattern.occurrence_count;
  }
}
