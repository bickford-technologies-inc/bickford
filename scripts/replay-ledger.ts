import { readFileSync } from "fs";
import { join } from "path";

const ledgerPath = join(__dirname, "../ledger/decisions.jsonl");

export function replayLedger() {
  const lines = readFileSync(ledgerPath, "utf-8").split("\n").filter(Boolean);
  return lines.map(line => JSON.parse(line));
}

if (require.main === module) {
  const entries = replayLedger();
  console.log("Ledger Replay:", entries);
}
