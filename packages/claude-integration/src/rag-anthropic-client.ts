/**
 * RAG-Enabled Anthropic Client
 * 
 * Constitutional enforcement + Memory-augmented responses
 * 
 * Key Features:
 * 1. Retrieves relevant history from memory ledger
 * 2. Enriches context before calling Anthropic
 * 3. Logs interactions for future retrieval
 * 4. Improves recall over time (compound intelligence)
 */

import { MemoryLedger, type MemoryLedgerEntry } from "./memory-ledger";

export interface RAGAnthropicConfig {
  apiKey: string;
  canon: {
    allowedModels: string[];
    maxTokensPerRequest: number;
    constitutionalConstraints: {
      noHarmfulContent: boolean;
      noPersonalData: boolean;
    };
  };
  memoryLedger: MemoryLedger;
  rag: {
    enabled: boolean;
    maxHistoryItems: number;
    minSimilarity: number;
    includeCategories?: string[];
  };
}

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface CompletionResult {
  content: Array<{ type: "text"; text: string }>;
  model: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
  stop_reason: string;
}

export class CanonViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CanonViolationError";
  }
}

export class RAGAnthropicClient {
  private config: RAGAnthropicConfig;
  private requestCount = 0;

  constructor(config: RAGAnthropicConfig) {
    this.config = config;
  }

  /**
   * Execute with RAG: Memory-augmented completion
   */
  async complete(params: {
    messages: Message[];
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<CompletionResult & { ragContext?: MemoryLedgerEntry[] }> {
    const startTime = performance.now();
    this.requestCount++;

    // Extract user query
    const userMessage = params.messages.find((message) => message.role === "user");
    const query = userMessage?.content || "";

    try {
      // 1. ENFORCE CANON
      await this.enforceCanon(params);

      // 2. RETRIEVE RELEVANT HISTORY (RAG)
      let ragContext: MemoryLedgerEntry[] = [];
      let enrichedMessages = params.messages;

      if (this.config.rag.enabled && query) {
        ragContext = await this.retrieveRelevantHistory(query);

        if (ragContext.length > 0) {
          // Build context from history
          const contextMessage: Message = {
            role: "system",
            content: this.buildRAGContext(ragContext),
          };

          // Inject context before user message
          enrichedMessages = [contextMessage, ...params.messages];

          console.log(
            `✓ RAG: Found ${ragContext.length} relevant past interactions`
          );
        }
      }

      // 3. CALL ANTHROPIC API
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": this.config.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: params.model || this.config.canon.allowedModels[0],
          messages: enrichedMessages,
          max_tokens: params.maxTokens || 1024,
          temperature: params.temperature || 1.0,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Anthropic API error: ${error}`);
      }

      const data = (await response.json()) as CompletionResult;
      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);

      // 4. APPEND TO LEDGER (with metadata)
      await this.config.memoryLedger.append({
        eventType: "anthropic_completion",
        payload: {
          query,
          response: data.content[0]?.text || "",
          model: data.model,
          success: true,
          confidence: this.estimateConfidence(data),
        },
        metadata: {
          category: this.categorizeQuery(query),
          qualityScore: this.estimateQuality(data, ragContext),
          processingTime,
          tags: this.extractTags(query),
        },
        timestamp: new Date().toISOString(),
      });

      console.log(`✓ Logged to memory ledger (${processingTime}ms)`);

      return {
        ...data,
        ragContext,
      };
    } catch (error) {
      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);

      // Log failure to ledger
      if (error instanceof CanonViolationError) {
        await this.config.memoryLedger.append({
          eventType: "canon_violation",
          payload: {
            query,
            response: error.message,
            success: false,
            violationType: "canon_enforcement",
          },
          metadata: {
            category: "violation",
            qualityScore: 0,
            processingTime,
            tags: ["violation", "blocked"],
          },
          timestamp: new Date().toISOString(),
        });
      }

      throw error;
    }
  }

  /**
   * Retrieve relevant history from memory ledger
   */
  private async retrieveRelevantHistory(
    query: string
  ): Promise<MemoryLedgerEntry[]> {
    return this.config.memoryLedger.searchSimilar(query, {
      limit: this.config.rag.maxHistoryItems,
      minSimilarity: this.config.rag.minSimilarity,
      successOnly: true,
      minQualityScore: 0.5,
      includeCategories: this.config.rag.includeCategories,
    });
  }

  /**
   * Build RAG context string from history
   */
  private buildRAGContext(history: MemoryLedgerEntry[]): string {
    const contextParts = ["Relevant information from past interactions:", ""];

    history.forEach((entry, index) => {
      contextParts.push(`[${index + 1}] Previous Query: ${entry.payload.query}`);
      contextParts.push(
        `Response: ${entry.payload.response?.slice(0, 200) ?? ""}...`
      );
      contextParts.push("");
    });

    contextParts.push("Use this context to provide a more informed response.");

    return contextParts.join("\n");
  }

  /**
   * Canon enforcement (unchanged from original)
   */
  private async enforceCanon(params: {
    model?: string;
    maxTokens?: number;
    messages: Message[];
  }): Promise<void> {
    const model = params.model || this.config.canon.allowedModels[0];

    if (!this.config.canon.allowedModels.includes(model)) {
      throw new CanonViolationError(
        `Model ${model} not in allowed list: ${this.config.canon.allowedModels.join(", ")}`
      );
    }

    const requestedTokens = params.maxTokens || 1024;
    if (requestedTokens > this.config.canon.maxTokensPerRequest) {
      throw new CanonViolationError(
        `Requested ${requestedTokens} tokens exceeds limit of ${this.config.canon.maxTokensPerRequest}`
      );
    }

    if (this.config.canon.constitutionalConstraints.noPersonalData) {
      const hasPersonalData = this.detectPersonalData(params.messages);
      if (hasPersonalData) {
        throw new CanonViolationError(
          "Personal data detected in request - violates canon constraint"
        );
      }
    }
  }

  /**
   * Simple personal data detection (placeholder)
   */
  private detectPersonalData(messages: Message[]): boolean {
    const patterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{16}\b/, // Credit card
      /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i, // Email
    ];

    const text = messages.map((message) => message.content).join(" ");
    return patterns.some((pattern) => pattern.test(text));
  }

  /**
   * Categorize query for analytics
   */
  private categorizeQuery(query: string): string {
    const lower = query.toLowerCase();

    if (lower.includes("code") || lower.includes("function") || lower.includes("debug")) {
      return "programming";
    }
    if (lower.includes("explain") || lower.includes("what is") || lower.includes("how does")) {
      return "explanation";
    }
    if (lower.includes("create") || lower.includes("generate") || lower.includes("write")) {
      return "generation";
    }
    if (lower.includes("analyze") || lower.includes("compare") || lower.includes("evaluate")) {
      return "analysis";
    }

    return "general";
  }

  /**
   * Extract tags from query
   */
  private extractTags(query: string): string[] {
    const tags: string[] = [];
    const lower = query.toLowerCase();

    if (lower.includes("bickford")) tags.push("bickford");
    if (lower.includes("anthropic")) tags.push("anthropic");
    if (lower.includes("constitutional")) tags.push("constitutional-ai");
    if (lower.includes("ledger")) tags.push("ledger");
    if (lower.includes("governance")) tags.push("governance");

    return tags;
  }

  /**
   * Estimate confidence from response
   */
  private estimateConfidence(data: CompletionResult): number {
    // Simple heuristic: longer responses = higher confidence
    const text = data.content[0]?.text || "";
    const length = text.length;

    if (length > 1000) return 0.9;
    if (length > 500) return 0.8;
    if (length > 200) return 0.7;
    return 0.6;
  }

  /**
   * Estimate quality of response
   */
  private estimateQuality(
    data: CompletionResult,
    ragContext: MemoryLedgerEntry[]
  ): number {
    let quality = 0.7; // Base quality

    // Higher quality if RAG context was used
    if (ragContext.length > 0) {
      quality += 0.1;
    }

    // Higher quality for longer, more detailed responses
    const text = data.content[0]?.text || "";
    if (text.length > 500) {
      quality += 0.1;
    }

    // Cap at 1.0
    return Math.min(quality, 1.0);
  }

  /**
   * Get analytics from memory ledger
   */
  getAnalytics() {
    return this.config.memoryLedger.getAnalytics();
  }

  /**
   * Get recall improvement metrics
   */
  getRecallMetrics() {
    const analytics = this.config.memoryLedger.getAnalytics();

    return {
      totalInteractions: analytics.totalEntries,
      successRate: analytics.successRate,
      avgQualityScore: analytics.avgQualityScore,
      ragEnabled: this.config.rag.enabled,
      estimatedImprovement: this.estimateRecallImprovement(analytics.totalEntries),
    };
  }

  /**
   * Estimate recall improvement based on interaction count
   */
  private estimateRecallImprovement(totalEntries: number): string {
    if (totalEntries < 10) return "0% (insufficient history)";
    if (totalEntries < 50) return "5-10% (early learning)";
    if (totalEntries < 200) return "15-25% (establishing patterns)";
    if (totalEntries < 1000) return "30-50% (strong institutional memory)";
    return "50%+ (mature knowledge base)";
  }

  /**
   * Export training data for fine-tuning
   */
  exportForFineTuning(options?: {
    minQualityScore?: number;
    successOnly?: boolean;
    limit?: number;
  }) {
    return this.config.memoryLedger.exportForFineTuning(options);
  }
}
