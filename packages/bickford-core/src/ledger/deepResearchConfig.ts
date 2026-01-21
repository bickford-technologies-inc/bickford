import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type DeepResearchConfigEntry = {
  id: string;
  intent: string;
  model: string;
  tools: string[];
  effectiveMaxToolCalls?: number;
  effectiveTimeoutMs: number;
  workflowId?: string;
  workflowName?: string;
  valuePerHourUsd?: number;
  continuousCompounding?: boolean;
  background: boolean;
  reason: "submitted" | "request_failed" | "request_error" | "missing_api_key";
  createdAt: string;
  hash: string;
};

const LEDGER_DIR = path.resolve(process.cwd(), ".bickford-deep-research");
const CONFIG_FILE = path.join(LEDGER_DIR, "config.jsonl");

function ensureLedgerDir() {
  if (!fs.existsSync(LEDGER_DIR)) {
    fs.mkdirSync(LEDGER_DIR, { recursive: true });
  }
}

function hashEntry(entry: Omit<DeepResearchConfigEntry, "hash">) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(entry))
    .digest("hex");
}

export function appendDeepResearchConfig(
  entry: Omit<DeepResearchConfigEntry, "hash">,
): DeepResearchConfigEntry {
  const hash = hashEntry(entry);
  const full = { ...entry, hash };
  ensureLedgerDir();
  fs.appendFileSync(CONFIG_FILE, `${JSON.stringify(full)}\n`);
  return full;
}

export function readDeepResearchConfig(intent: string) {
  if (!fs.existsSync(CONFIG_FILE)) {
    return undefined;
  }

  const lines = fs
    .readFileSync(CONFIG_FILE, "utf8")
    .split("\n")
    .filter(Boolean);

  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const entry = JSON.parse(lines[i]) as DeepResearchConfigEntry;
    if (entry.intent === intent) {
      return entry;
    }
  }

  return undefined;
}
