// ClaudeEnforcer: single-responsibility, silent execution. All enforcement logic merged and flattened.

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
  // ClaudeEnforcer collapsed: delegates all enforcement to ConstitutionalEnforcer. No silent execution, all errors explicit.
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
  private organizationId: string;

  constructor(apiKey?: string, organizationId?: string) {
    super();
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || "";
    this.organizationId = organizationId || process.env.ANTHROPIC_ORG_ID || "";
    this.apiEndpoint = "https://api.anthropic.com/v1/messages";
  }

  async enforceClaudeRequest(
    request: ClaudeRequest,
  ): Promise<EnforcedClaudeResponse> {
    const startTime = performance.now();

    const userPrompt = this.extractUserPrompt(request);
    const preEnforcement = await this.enforce(userPrompt, {});

    if (!preEnforcement.allowed) {
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

    const enforcedRequest = this.injectConstitutionalPrompt(request);
    const claudeResponse = await this.callClaude(enforcedRequest);
    const postEnforcement = await this.verifyClaudeResponse(
      claudeResponse,
      preEnforcement,
    );
    const proofChain = this.generateProofChain(
      request,
      claudeResponse,
      postEnforcement,
    );
    const latencyOverhead = performance.now() - startTime;
      const enforcement = await this.enforce(userPrompt, {});
      if (!enforcement.allowed) {
        throw new Error(`Execution denied: ${enforcement.reasoning}`);
      }
      // All enforcement logic is handled by ConstitutionalEnforcer
      // No silent execution, all errors explicit
      return {
        enforcement,
        proof_chain: this.generateProofChain(request, null, enforcement),
      };
      system?: string;
      temperature?: number;
    } = {
      model: request.model,
      max_tokens: request.max_tokens || 1024,
      messages: request.messages,
    };
    if (typeof request.system === "string" && request.system.length > 0) {
      apiPayload.system = request.system;
    }
    if (typeof request.temperature === "number") {
      apiPayload.temperature = request.temperature;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      "anthropic-version": "2023-06-01",
    };
    if (this.organizationId) {
      headers["anthropic-organization"] = this.organizationId;
    }

    const response = await fetch(this.apiEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(apiPayload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw new CanonViolationError(
        `Claude API error: ${response.statusText}\nBody: ${responseText}`,
      );
    }

    return JSON.parse(responseText) as ClaudeResponse;
  }

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

  private injectConstitutionalPrompt(request: ClaudeRequest): ClaudeRequest {
    return {
      ...request,
      system: request.system
        ? `${CONSTITUTIONAL_AI_SYSTEM_PROMPT}\n\n${request.system}`
        : CONSTITUTIONAL_AI_SYSTEM_PROMPT,
    };
  }

  private async verifyClaudeResponse(
    response: ClaudeResponse,
    preEnforcement: EnforcementResult,
  ): Promise<EnforcementResult> {
    const responseText = response.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n");

    const postCheck = await this.enforce(responseText, {});

    if (preEnforcement.allowed && !postCheck.allowed) {
      return {
        ...postCheck,
        reasoning: `WARNING: Claude generated content that violates constraints despite Constitutional AI system prompt. Violations: ${postCheck.violated_constraints.join(", ")}`,
      };
    }

    return postCheck;
  }

  private generateProofChain(
    request: ClaudeRequest,
    response: ClaudeResponse | null,
    enforcement: EnforcementResult,
  ): string[] {
    const chain: string[] = [];

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

    chain.push(`ENFORCEMENT:${enforcement.proof_hash}`);

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

    const merkleRoot = createHash("sha256")
      .update(chain.join(":"))
      .digest("hex");
    chain.push(`MERKLE_ROOT:${merkleRoot}`);

    return chain;
  }

  private extractUserPrompt(request: ClaudeRequest): string {
    const userMessages = request.messages.filter((m) => m.role === "user");
    return userMessages.map((m) => m.content).join("\n");
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  private calculateCost(tokens: number, model: string): number {
    const pricing: Record<string, { input: number; output: number }> = {
      "claude-opus-4": { input: 0.015, output: 0.075 },
      "claude-sonnet-4": { input: 0.003, output: 0.015 },
      "claude-haiku-4": { input: 0.00025, output: 0.00125 },
    };

    const modelPricing = pricing[model] || pricing["claude-sonnet-4"];

    const inputCost = (tokens / 2 / 1000) * modelPricing.input;
    const outputCost = (tokens / 2 / 1000) * modelPricing.output;

    return inputCost + outputCost;
  }
  getEnforcementStats() {
    return {
      constraints: this.listConstraints(),
      policy_version: this.getPolicyVersion(),
      enforcement_mode: "MECHANICAL", // vs "ASPIRATIONAL"
      proof_type: "CRYPTOGRAPHIC",
    };
  }
}

export class CanonViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CanonViolationError";
  }
}
