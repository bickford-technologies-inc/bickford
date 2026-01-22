import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type DeepResearchLedgerEntry = {
  id: string;
  intent: string;
  model: string;
  responseId?: string;
  status?: string;
  background: boolean;
  maxToolCalls?: number;
  effectiveMaxToolCalls?: number;
  effectiveTimeoutMs?: number;
  workflowId?: string;
  workflowName?: string;
  valuePerHourUsd?: number;
  continuousCompounding?: boolean;
  tools: string[];
  requestedAt: string;
  error?: string;
  hash: string;
};

const LEDGER_DIR = path.resolve(process.cwd(), ".bickford-deep-research");
const LEDGER_FILE = path.join(LEDGER_DIR, "ledger.jsonl");

function ensureLedgerDir() {
  if (!fs.existsSync(LEDGER_DIR)) {
    fs.mkdirSync(LEDGER_DIR, { recursive: true });
  }
}

function hashEntry(entry: Omit<DeepResearchLedgerEntry, "hash">) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(entry))
    .digest("hex");
}

export function appendDeepResearchLedger(
  entry: Omit<DeepResearchLedgerEntry, "hash">,
): DeepResearchLedgerEntry {
  const hash = hashEntry(entry);
  const full = { ...entry, hash };
  ensureLedgerDir();
  fs.appendFileSync(LEDGER_FILE, `${JSON.stringify(full)}\n`);
  return full;
}
