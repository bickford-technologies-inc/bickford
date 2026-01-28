import { write, file } from "bun";
import { createHash } from "crypto";

// Ledger file path
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

// Create a new OPTR record with hash chain
async function appendOptrRecord(record: any) {
  const previousHash = await getPreviousHash();
  const recordWithPrev = { ...record, previousHash };
  const currentHash = createHash("sha256")
    .update(previousHash + JSON.stringify(recordWithPrev))
    .digest("hex");
  const entry = { ...recordWithPrev, currentHash };
  await write(ledgerPath, JSON.stringify(entry) + "\n", { append: true });
  console.log("OPTR record appended with hash chain:", entry);
}

// Example OPTR event
const optrEvent = {
  eventType: "compliance_action",
  actor: "system",
  action: "AI decision logged",
  timestamp: new Date().toISOString(),
  details: {
    model: "claude-sonnet-4-5",
    inputHash: "abc123...",
    outputHash: "def456...",
    auditTrail: true,
  },
};

await appendOptrRecord(optrEvent);
