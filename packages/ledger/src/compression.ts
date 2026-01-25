// Rolling Window Conversation Compressor for Bickford
// Phase 1: Simple, robust, ledger-integrated
import type { ConversationMessage } from "@bickford/types";

export interface CompressorConfig {
  windowSize: number; // Number of most recent messages to keep in full
  summarizer: (messages: ConversationMessage[]) => Promise<ConversationMessage>;
}

export class RollingWindowCompressor {
  private windowSize: number;
  private summarizer: (
    messages: ConversationMessage[],
  ) => Promise<ConversationMessage>;

  constructor(config: CompressorConfig) {
    this.windowSize = config.windowSize;
    this.summarizer = config.summarizer;
  }

  async compress(
    messages: ConversationMessage[],
  ): Promise<ConversationMessage[]> {
    if (messages.length <= this.windowSize) return messages;
    const recent = messages.slice(-this.windowSize);
    const older = messages.slice(0, -this.windowSize);
    const summary = await this.summarizer(older);
    return [summary, ...recent];
  }
}

// Fast token estimation (1 token ≈ 4 chars)
export function estimateTokensFast(messages: ConversationMessage[]): number {
  return Math.ceil(messages.reduce((sum, m) => sum + m.content.length, 0) / 4);
}
