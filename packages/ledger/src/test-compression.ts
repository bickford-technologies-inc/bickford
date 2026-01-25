// Test script for rolling window compression and ledger logging
import { RollingWindowCompressor, estimateTokensFast } from "./compression";
import { anthropicSummarizer } from "./anthropicSummarizer";
import { MemoryLedger } from "./memory-ledger";
import type { ConversationMessage } from "@bickford/types";

async function main() {
  // Example conversation
  const conversation: ConversationMessage[] = [
    {
      id: "1",
      role: "user",
      content: "How do I set up Prisma in my project?",
      timestamp: Date.now(),
    },
    {
      id: "2",
      role: "agent",
      content: "Install Prisma CLI and initialize your schema.",
      timestamp: Date.now(),
    },
    {
      id: "3",
      role: "user",
      content: "How do I create a migration?",
      timestamp: Date.now(),
    },
    {
      id: "4",
      role: "agent",
      content: "Use `prisma migrate dev --name init`.",
      timestamp: Date.now(),
    },
    {
      id: "5",
      role: "user",
      content: "What about deploying migrations?",
      timestamp: Date.now(),
    },
    {
      id: "6",
      role: "agent",
      content: "Use `prisma migrate deploy` in production.",
      timestamp: Date.now(),
    },
    {
      id: "7",
      role: "user",
      content: "How do I connect to Postgres?",
      timestamp: Date.now(),
    },
    {
      id: "8",
      role: "agent",
      content: "Set the DATABASE_URL environment variable.",
      timestamp: Date.now(),
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
      query: "compression",
      response: "success",
      success: true,
    },
    metadata: {
      qualityScore: 1, // Placeholder
    },
    timestamp: new Date().toISOString(),
  });

  console.log("Original tokens:", originalTokens);
  console.log("Compressed tokens:", compressedTokens);
  console.log("Compression ratio:", compressedTokens / originalTokens);
  console.log("Compressed conversation:", compressed);
}

main().catch(console.error);
