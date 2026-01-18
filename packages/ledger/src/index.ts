import fs from "node:fs";
import path from "node:path";

const LEDGER_DIR = path.join(process.cwd(), ".bickford");
const LEDGER_FILE = path.join(LEDGER_DIR, "ledger.jsonl");

export interface LedgerEntry {
  id: string;
  timestamp: string;
  status: "LOCKED" | "REFUSED";
  payload: unknown;
}

export function appendLedger(entry: LedgerEntry) {
  if (!fs.existsSync(LEDGER_DIR)) {
    fs.mkdirSync(LEDGER_DIR, { recursive: true });
  }

  const line = JSON.stringify(entry) + "\n";
  fs.appendFileSync(LEDGER_FILE, line, { encoding: "utf-8" });
}
