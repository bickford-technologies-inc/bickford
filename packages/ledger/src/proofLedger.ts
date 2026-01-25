import * as path from "node:path";
import { promises as fs } from "fs";

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

async function ensureLedgerDir() {
  await fs.writeFile(LEDGER_DIR + "/.bunkeep", ""); // ensure dir exists by writing a dummy file
}

export async function appendProofLedger(entry: ProofLedgerEntry) {
  await ensureLedgerDir();
  const line = `${JSON.stringify(entry)}\n`;
  await fs.appendFile(LEDGER_FILE, line);
  return entry;
}

export async function readProofLedger(
  intentId: string,
): Promise<ProofLedgerEntry[]> {
  try {
    await fs.access(LEDGER_FILE);
    const lines = (await fs.readFile(LEDGER_FILE, "utf8"))
      .split("\n")
      .filter(Boolean);
    return lines
      .map((line) => JSON.parse(line))
      .filter((entry) => entry.intentId === intentId);
  } catch {
    return [];
  }
}
