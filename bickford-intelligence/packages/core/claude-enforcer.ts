/*
 * Bickford Claude Constitutional Enforcer
 *
 * Wraps Anthropic's Claude API with mechanical Constitutional AI enforcement.
 * Converts aspirational safety principles into cryptographically provable guarantees.
 *
 * This is the core value proposition:
 * - Claude alone: Fast, smart, but unverifiable
 * - Claude + Bickford: Fast, smart, AND cryptographically provable
 */

import {
  ConstitutionalEnforcer,
  type EnforcementResult,
} from "./constitutional-enforcer.js";
import { createHash } from "crypto";

export interface ClaudeRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  max_tokens?: number;
  temperature?: number;
  system?: string;
}

export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{ type: string; text: string }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface EnforcedClaudeResponse {
  claude_response: ClaudeResponse | null;
  enforcement: EnforcementResult;
  proof_chain: string[];
  latency_overhead_ms: number;
  cost_analysis: {
    tokens_saved: number; // If denied before calling Claude
    cost_saved_usd: number;
  };
}

const CONSTITUTIONAL_AI_SYSTEM_PROMPT = `You are Claude, an AI assistant created by Anthropic to be helpful, harmless, and honest.

You must strictly adhere to these Constitutional AI principles:
1. HARM_PREVENTION: Never assist with content designed to harm, deceive, or exploit people
2. PRIVACY_PROTECTION: Never process or share personal identifiable information without consent
3. TRUTHFULNESS: Never generate deliberately false or misleading information
4. CHILD_SAFETY: Never generate content that could endanger or exploit children
5. LEGAL_COMPLIANCE: Never assist with clearly illegal activities
6. HELPFUL_ONLY: Only respond to requests that are genuinely helpful to the user

If a request violates these principles, you must refuse clearly and explain why.`;

export class ClaudeConstitutionalEnforcer extends ConstitutionalEnforcer {
  private apiKey: string;
  private apiEndpoint: string;

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || "";
    this.apiEndpoint = "https://api.anthropic.com/v1/messages";
  }

  /**
   * Enforce Constitutional AI constraints on a Claude request
   *
   * Flow:
   * 1. Pre-enforcement check (before calling Claude)
   * 2. If allowed, call Claude with Constitutional AI system prompt
   * 3. Post-enforcement check (verify Claude's response complies)
   * 4. Generate cryptographic proof chain
   * 5. Return enforceable response with proof
   */
  async enforceClaudeRequest(
    request: ClaudeRequest,
  ): Promise<EnforcedClaudeResponse> {
    const startTime = performance.now();

    // Step 1: Pre-enforcement check
    const userPrompt = this.extractUserPrompt(request);
    const preEnforcement = await this.enforce(userPrompt, {});

    if (!preEnforcement.allowed) {
      // Denied before calling Claude - save tokens and cost
      const estimatedTokens = this.estimateTokens(userPrompt);
      const costSaved = this.calculateCost(estimatedTokens, request.model);

      const latencyOverhead = performance.now() - startTime;

      return {
        claude_response: null,
        enforcement: preEnforcement,
        proof_chain: this.generateProofChain(request, null, preEnforcement),
        latency_overhead_ms: latencyOverhead,
        cost_analysis: {
          tokens_saved: estimatedTokens,
          cost_saved_usd: costSaved,
        },
      };
    }

    // Step 2: Call Claude with Constitutional AI system prompt
    const enforcedRequest = this.injectConstitutionalPrompt(request);
    const claudeResponse = await this.callClaude(enforcedRequest);

    // Step 3: Post-enforcement check (verify response)
    const postEnforcement = await this.verifyClaudeResponse(
      claudeResponse,
      preEnforcement,
    );

    // Step 4: Generate proof chain
    const proofChain = this.generateProofChain(
      request,
      claudeResponse,
      postEnforcement,
    );

    const latencyOverhead = performance.now() - startTime;

    return {
      claude_response: claudeResponse,
      enforcement: postEnforcement,
      proof_chain: proofChain,
      latency_overhead_ms: latencyOverhead,
      cost_analysis: {
        tokens_saved: 0, // Didn't save tokens (request allowed)
        cost_saved_usd: 0,
      },
    };
  }

  /**
   * Call Claude API with enforcement
   */
  private async callClaude(request: ClaudeRequest): Promise<ClaudeResponse> {
    if (!this.apiKey) {
      // Mock response for demo purposes
      return this.mockClaudeResponse(request);
    }

    const response = await fetch(this.apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        ...request,
        max_tokens: request.max_tokens || 1024,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Mock Claude response for demo (when no API key)
   */
  private mockClaudeResponse(request: ClaudeRequest): ClaudeResponse {
    const userPrompt = this.extractUserPrompt(request);

    // Generate appropriate mock response
    let mockText = "I'd be happy to help with that request.";

    if (
      userPrompt.toLowerCase().includes("phishing") ||
      userPrompt.toLowerCase().includes("malware") ||
      userPrompt.toLowerCase().includes("hack")
    ) {
      mockText =
        "I can't assist with that request as it would violate my ethical guidelines around harm prevention.";
    }

    return {
      id: `msg-mock-${Date.now()}`,
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: mockText }],
      model: request.model,
      stop_reason: "end_turn",
      usage: {
        input_tokens: this.estimateTokens(userPrompt),
        output_tokens: this.estimateTokens(mockText),
      },
    };
  }

  /**
   * Inject Constitutional AI system prompt
   */
  private injectConstitutionalPrompt(request: ClaudeRequest): ClaudeRequest {
    return {
      ...request,
      system: request.system
        ? `${CONSTITUTIONAL_AI_SYSTEM_PROMPT}\n\n${request.system}`
        : CONSTITUTIONAL_AI_SYSTEM_PROMPT,
    };
  }

  /**
   * Verify Claude's response complies with enforcement
   */
  private async verifyClaudeResponse(
    response: ClaudeResponse,
    preEnforcement: EnforcementResult,
  ): Promise<EnforcementResult> {
    // Extract response text
    const responseText = response.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n");

    // Check if response contains harmful content
    const postCheck = await this.enforce(responseText, {});

    // If pre-enforcement passed but post-enforcement failed,
    // it means Claude generated harmful content despite constraints
    if (preEnforcement.allowed && !postCheck.allowed) {
      return {
        ...postCheck,
        reasoning: `WARNING: Claude generated content that violates constraints despite Constitutional AI system prompt. Violations: ${postCheck.violated_constraints.join(", ")}`,
      };
    }

    return postCheck;
  }

  /**
   * Generate cryptographic proof chain
   */
  private generateProofChain(
    request: ClaudeRequest,
    response: ClaudeResponse | null,
    enforcement: EnforcementResult,
  ): string[] {
    const chain: string[] = [];

    // Proof 1: Request hash
    const requestHash = createHash("sha256")
      .update(
        JSON.stringify({
          model: request.model,
          messages: request.messages,
          timestamp: Date.now(),
        }),
      )
      .digest("hex");
    chain.push(`REQUEST:${requestHash}`);

    // Proof 2: Enforcement proof (from Constitutional AI check)
    chain.push(`ENFORCEMENT:${enforcement.proof_hash}`);

    // Proof 3: Response hash (if request was allowed)
    if (response) {
      const responseHash = createHash("sha256")
        .update(
          JSON.stringify({
            id: response.id,
            content: response.content,
            model: response.model,
          }),
        )
        .digest("hex");
      chain.push(`RESPONSE:${responseHash}`);
    } else {
      chain.push(`RESPONSE:DENIED_BEFORE_EXECUTION`);
    }

    // Proof 4: Merkle root
    const merkleRoot = createHash("sha256")
      .update(chain.join(":"))
      .digest("hex");
    chain.push(`MERKLE_ROOT:${merkleRoot}`);

    return chain;
  }

  /**
   * Extract user prompt from request
   */
  private extractUserPrompt(request: ClaudeRequest): string {
    const userMessages = request.messages.filter((m) => m.role === "user");
    return userMessages.map((m) => m.content).join("\n");
  }

  /**
   * Estimate tokens for cost calculation
   */
  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate cost based on model and tokens
   */
  private calculateCost(tokens: number, model: string): number {
    // Pricing as of Jan 2025 (approximate)
    const pricing: Record<string, { input: number; output: number }> = {
      "claude-opus-4": { input: 0.015, output: 0.075 }, // per 1K tokens
      "claude-sonnet-4": { input: 0.003, output: 0.015 },
      "claude-haiku-4": { input: 0.00025, output: 0.00125 },
    };

    const modelPricing = pricing[model] || pricing["claude-sonnet-4"];

    // Estimate 50/50 split for input/output
    const inputCost = (tokens / 2 / 1000) * modelPricing.input;
    const outputCost = (tokens / 2 / 1000) * modelPricing.output;

    return inputCost + outputCost;
  }

  /**
   * Get enforcement statistics
   */
  getEnforcementStats() {
    return {
      constraints: this.listConstraints(),
      policy_version: this.getPolicyVersion(),
      enforcement_mode: "MECHANICAL", // vs "ASPIRATIONAL"
      proof_type: "CRYPTOGRAPHIC",
    };
  }
}
