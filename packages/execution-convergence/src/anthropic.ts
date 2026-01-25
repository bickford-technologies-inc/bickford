// packages/execution-convergence/src/anthropic.ts
// Bun-compatible Anthropic execution adapter for Bickford
import type { ExecutionAdapter } from "@bickford/types/src/ExecutionAdapter";

export interface AnthropicInput {
  prompt: string;
  model?: string;
  max_tokens?: number;
}

export interface AnthropicOutput {
  completion: string;
  raw: any;
}

export class AnthropicAdapter implements ExecutionAdapter<
  AnthropicInput,
  AnthropicOutput
> {
  async execute(input: AnthropicInput): Promise<AnthropicOutput> {
    const apiKey = Bun.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY in environment");
    const body = {
      model: input.model || "claude-3-opus-20240229",
      max_tokens: input.max_tokens || 32,
      messages: [{ role: "user", content: input.prompt }],
    };
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(
        `Anthropic API error: ${response.status} ${await response.text()}`,
      );
    }
    const data = await response.json();
    return {
      completion: data.content?.[0]?.text || "",
      raw: data,
    };
  }
}
