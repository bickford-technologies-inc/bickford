import fs from "fs";
import path from "path";

const LEDGER_DIR = path.join(process.cwd(), ".bickford", "ledger");

export type LedgerEntry = {
  id: string;
  timestamp: string;
  type: string;
  payload: unknown;
};

export function appendLedger(entry: LedgerEntry) {
  if (!fs.existsSync(LEDGER_DIR)) {
    fs.mkdirSync(LEDGER_DIR, { recursive: true });
  }

  const file = path.join(
    LEDGER_DIR,
    `${new Date().toISOString().slice(0, 10)}.jsonl`
  );

  fs.appendFileSync(file, JSON.stringify(entry) + "\n");
}
