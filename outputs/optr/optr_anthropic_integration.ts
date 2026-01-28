import { write, file } from "bun";
import { createHash } from "crypto";

// Replace with your Anthropic API key
const ANTHROPIC_API_KEY =
  process.env.ANTHROPIC_API_KEY || "YOUR_ANTHROPIC_API_KEY";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ledgerPath = "outputs/optr/optr_ledger.jsonl";

// Read previous hash from ledger
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

// Call Anthropic API for a compliance decision
async function getAnthropicDecision(input: string): Promise<string> {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-2.1",
      max_tokens: 256,
      messages: [{ role: "user", content: input }],
    }),
  });
  if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
  const data = await response.json();
  return data.content || data.completion || JSON.stringify(data);
}

// Create a new OPTR record with hash chain and Anthropic decision
async function appendOptrRecordWithAnthropic(input: string) {
  const previousHash = await getPreviousHash();
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
  // Read current content
  let current = "";
  try {
    current = await file(ledgerPath).text();
  } catch {}
  // Append new line in memory
  const updated = current + JSON.stringify(entry) + "\n";
  await write(ledgerPath, updated);
  console.log("OPTR record with Anthropic decision appended:", entry);
}

// Example usage
const complianceInput =
  "Is this AI output compliant with GDPR and enterprise audit requirements? Output: 'Customer data processed for support ticket #123.'";

(async () => {
  await appendOptrRecordWithAnthropic(complianceInput);
})();
