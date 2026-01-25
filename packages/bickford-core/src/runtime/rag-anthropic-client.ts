import {
  appendMemoryLedger,
  queryMemoryLedger,
  type MemoryLedgerMatch,
  type MemoryLedgerOptions,
} from "../ledger/memory-ledger";

export type RagClientOptions = {
  model?: string;
  apiKey?: string;
  ledgerOptions?: MemoryLedgerOptions;
  maxContextMatches?: number;
};

export type RagCompletion = {
  response: string;
  contextMatches: MemoryLedgerMatch[];
  qualityScore: number;
};

function buildContext(matches: MemoryLedgerMatch[]): string {
  if (!matches.length) return "";
  const snippets = matches.map((match, index) => {
    return [
      `Match ${index + 1} (score ${match.similarity.toFixed(2)}):`,
      `Q: ${match.entry.query}`,
      `A: ${match.entry.response}`,
    ].join("\n");
  });
  return `\n\nRelevant memory:\n${snippets.join("\n\n")}`;
}

function scoreQuality(matchCount: number): number {
  const baseQuality = 0.7;
  const bonus = matchCount * 0.08;
  return Math.min(baseQuality + bonus, 1);
}

async function callAnthropic(
  apiKey: string,
  model: string,
  prompt: string,
): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${errorText}`);
  }

  const payload = (await response.json()) as {
    content: Array<{ text?: string }>;
  };
  return payload.content?.map((part) => part.text ?? "").join("") ?? "";
}

export class RagAnthropicClient {
  private readonly model: string;
  private readonly apiKey?: string;
  private readonly ledgerOptions?: MemoryLedgerOptions;
  private readonly maxContextMatches: number;

  constructor(options?: RagClientOptions) {
    this.model = options?.model ?? "claude-3-5-sonnet-20241022";
    this.apiKey = options?.apiKey ?? process.env.ANTHROPIC_API_KEY;
    this.ledgerOptions = options?.ledgerOptions;
    this.maxContextMatches = options?.maxContextMatches ?? 5;
  }

  async complete(prompt: string, metadata?: Record<string, unknown>): Promise<RagCompletion> {
    const contextMatches = queryMemoryLedger(prompt, {
      ...this.ledgerOptions,
      limit: this.maxContextMatches,
    });
    const context = buildContext(contextMatches);
    const enrichedPrompt = `${prompt}${context}`.trim();
    const qualityScore = scoreQuality(contextMatches.length);

    let response: string;
    if (this.apiKey) {
      response = await callAnthropic(this.apiKey, this.model, enrichedPrompt);
    } else {
      response = [
        "[RAG demo response - no API key detected]",
        `Prompt: ${prompt}`,
        context ? "(Memory context included)" : "(No memory context)",
      ].join("\n");
    }

    appendMemoryLedger(
      {
        query: prompt,
        response,
        qualityScore,
        tags: ["rag"],
        metadata,
      },
      this.ledgerOptions,
    );

    return {
      response,
      contextMatches,
      qualityScore,
    };
  }
}
