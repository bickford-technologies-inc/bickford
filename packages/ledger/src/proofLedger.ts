import * as path from "node:path";

const { file: BunFile, write: BunWrite } = Bun;

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
  await BunWrite(LEDGER_DIR + "/.bunkeep", ""); // ensure dir exists by writing a dummy file
}

export async function appendProofLedger(entry: ProofLedgerEntry) {
  await ensureLedgerDir();
  const line = `${JSON.stringify(entry)}\n`;
  await BunWrite(LEDGER_FILE, line, { append: true });
  return entry;
}

export async function readProofLedger(
  intentId: string,
): Promise<ProofLedgerEntry[]> {
  const bunFile = BunFile(LEDGER_FILE);
  if (!(await bunFile.exists())) {
    return [];
  }
  const lines = (await bunFile.text()).split("\n").filter(Boolean);
  return lines
    .map((line) => JSON.parse(line))
    .filter((entry) => entry.intentId === intentId);
}
