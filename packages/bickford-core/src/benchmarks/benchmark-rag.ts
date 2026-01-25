import { RagAnthropicClient } from "../runtime/rag-anthropic-client";

const queries = [
  "What is Constitutional AI?",
  "How does Constitutional AI improve safety?",
  "Constitutional AI use cases for healthcare?",
  "How does the ledger improve recall?",
  "Explain decision continuity runtime.",
];

async function runBenchmark() {
  const client = new RagAnthropicClient();
  const results: Array<{
    query: string;
    matchCount: number;
    qualityScore: number;
  }> = [];

  for (const query of queries) {
    const completion = await client.complete(query, { benchmark: true });
    results.push({
      query,
      matchCount: completion.contextMatches.length,
      qualityScore: completion.qualityScore,
    });
  }

  console.log("\nRAG Benchmark Results");
  console.log("====================");
  for (const result of results) {
    console.log(
      `- ${result.query}\n  matches=${result.matchCount} quality=${result.qualityScore.toFixed(2)}`,
    );
  }
}

runBenchmark().catch((error) => {
  console.error("Benchmark failed:", error);
  process.exitCode = 1;
});
