import { RagAnthropicClient } from "../packages/bickford-core/src/runtime/rag-anthropic-client";

async function runDemo() {
  const client = new RagAnthropicClient();

  const queries = [
    "What is Constitutional AI?",
    "How does Constitutional AI improve safety?",
    "Constitutional AI use cases for healthcare?",
  ];

  for (const query of queries) {
    const completion = await client.complete(query, { demo: true });
    console.log("\n--- Query ---");
    console.log(query);
    console.log("Matches:", completion.contextMatches.length);
    console.log("Quality:", completion.qualityScore.toFixed(2));
    console.log("Response:\n", completion.response);
  }
}

runDemo().catch((error) => {
  console.error("Demo failed:", error);
  process.exitCode = 1;
});
