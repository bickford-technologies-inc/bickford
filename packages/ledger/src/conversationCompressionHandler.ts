// Backend handler for conversation compression and ledger logging
import { RollingWindowCompressor, estimateTokensFast } from "./compression";
import { anthropicSummarizer } from "./anthropicSummarizer";
import { MemoryLedger } from "./memory-ledger";
import type { ConversationMessage } from "@bickford/types";

const compressor = new RollingWindowCompressor({
  windowSize: 5,
  summarizer: anthropicSummarizer,
});
const ledger = new MemoryLedger();

/**
 * Compresses conversation if needed, logs event, and returns compressed context.
 * Use this in your backend before sending to Claude/Anthropic.
 */
export async function compressAndLogIfNeeded(
  messages: ConversationMessage[],
): Promise<ConversationMessage[]> {
  const originalTokens = estimateTokensFast(messages);
  if (originalTokens <= 8000) return messages;
  const compressed = await compressor.compress(messages);
  const compressedTokens = estimateTokensFast(compressed);
  await ledger.append({
    eventType: "compression_executed",
    payload: {
      originalTokens,
      compressedTokens,
      compressionRatio: compressedTokens / originalTokens,
      strategy: "rolling_window",
      messagesCompressed: messages.length - compressed.length,
      qualityScore: 1, // Placeholder
    },
    metadata: {},
    timestamp: new Date().toISOString(),
  });
  return compressed;
}
