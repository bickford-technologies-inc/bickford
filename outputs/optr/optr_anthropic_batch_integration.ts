import { write, file } from "bun";
import { createHash } from "crypto";

const ANTHROPIC_API_KEY =
  process.env.ANTHROPIC_API_KEY || "YOUR_ANTHROPIC_API_KEY";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ledgerPath = "outputs/optr/optr_ledger.jsonl";

async function getPreviousHash(): Promise<string> {
  try {
    const lines = (await file(ledgerPath).text()).trim().split("\n");
    if (lines.length === 0 || !lines[0]) return "0".repeat(64);
    const last = JSON.parse(lines[lines.length - 1]);
    return last.currentHash || "0".repeat(64);
  } catch {
    return "0".repeat(64);
  }
}

async function getAnthropicDecision(input: string): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "content-type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 256,
      messages: [{ role: "user", content: input }],
    }),
  });
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `Anthropic API error: ${response.status}\nBody: ${errorBody}`,
    );
    throw new Error(`Anthropic API error: ${response.status}`);
  }
  const data = await response.json();
  return data.content || data.completion || JSON.stringify(data);
}

async function appendOptrRecordWithAnthropic(
  input: string,
  previousHash: string,
) {
  const anthropicDecision = await getAnthropicDecision(input);
  const record = {
    eventType: "anthropic_compliance_decision",
    actor: "anthropic",
    action: "AI compliance decision",
    timestamp: new Date().toISOString(),
    input,
    decision: anthropicDecision,
    previousHash,
  };
  const currentHash = createHash("sha256")
    .update(previousHash + JSON.stringify(record))
    .digest("hex");
  const entry = { ...record, currentHash };
  await write(ledgerPath, JSON.stringify(entry) + "\n", { append: true });
  return currentHash;
}

async function runBatchExecutions(n: number) {
  let previousHash = await getPreviousHash();
  for (let i = 1; i <= n; i++) {
    const input = `Execution ${i}: Is this AI output compliant with GDPR and enterprise audit requirements? Output: 'Customer data processed for support ticket #${i}.'`;
    previousHash = await appendOptrRecordWithAnthropic(input, previousHash);
    console.log(`Execution ${i} complete.`);
  }
  console.log(`${n} OPTR Anthropic executions completed.`);
}

await runBatchExecutions(1000);
