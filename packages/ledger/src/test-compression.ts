// Test script for rolling window compression and ledger logging
import { RollingWindowCompressor, estimateTokensFast } from "./compression";
import { anthropicSummarizer } from "./anthropicSummarizer";
import { MemoryLedger } from "./memory-ledger";
import type { ConversationMessage } from "@bickford/types";

async function main() {
  // Example conversation
  const conversation: ConversationMessage[] = [
    { role: "user", content: "How do I set up Prisma in my project?" },
    {
      role: "assistant",
      content: "Install Prisma CLI and initialize your schema.",
    },
    { role: "user", content: "How do I create a migration?" },
    { role: "assistant", content: "Use `prisma migrate dev --name init`." },
    { role: "user", content: "What about deploying migrations?" },
    {
      role: "assistant",
      content: "Use `prisma migrate deploy` in production.",
    },
    { role: "user", content: "How do I connect to Postgres?" },
    {
      role: "assistant",
      content: "Set the DATABASE_URL environment variable.",
    },
  ];

  const compressor = new RollingWindowCompressor({
    windowSize: 3,
    summarizer: anthropicSummarizer,
  });

  const ledger = new MemoryLedger();

  const originalTokens = estimateTokensFast(conversation);
  const compressed = await compressor.compress(conversation);
  const compressedTokens = estimateTokensFast(compressed);

  await ledger.append({
    eventType: "compression_executed",
    payload: {
      originalTokens,
      compressedTokens,
      compressionRatio: compressedTokens / originalTokens,
      strategy: "rolling_window",
      messagesCompressed: conversation.length - compressed.length,
      qualityScore: 1, // Placeholder
    },
    metadata: {},
    timestamp: new Date().toISOString(),
  });

  console.log("Original tokens:", originalTokens);
  console.log("Compressed tokens:", compressedTokens);
  console.log("Compression ratio:", compressedTokens / originalTokens);
  console.log("Compressed conversation:", compressed);
}

main().catch(console.error);
