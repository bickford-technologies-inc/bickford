import * as fs from "node:fs";
import * as path from "node:path";

export type ProofLedgerEntry = {
  id: string;
  kind: string;
  intentId: string;
  payload: unknown;
  authority: string;
  hash: string;
  signature: string;
  createdAt: string;
};

const LEDGER_DIR = path.resolve(process.cwd(), ".bickford-proof-ledger");
const LEDGER_FILE = path.join(LEDGER_DIR, "ledger.jsonl");

function ensureLedgerDir() {
  if (!fs.existsSync(LEDGER_DIR)) {
    fs.mkdirSync(LEDGER_DIR, { recursive: true });
  }
}

export function appendProofLedger(entry: ProofLedgerEntry) {
  ensureLedgerDir();
  const line = `${JSON.stringify(entry)}\n`;
  fs.appendFileSync(LEDGER_FILE, line);
  return entry;
}

export function readProofLedger(intentId: string): ProofLedgerEntry[] {
  if (!fs.existsSync(LEDGER_FILE)) {
    return [];
  }

  const lines = fs
    .readFileSync(LEDGER_FILE, "utf8")
    .split("\n")
    .filter(Boolean);

  return lines
    .map((line) => JSON.parse(line) as ProofLedgerEntry)
    .filter((entry) => entry.intentId === intentId);
}
