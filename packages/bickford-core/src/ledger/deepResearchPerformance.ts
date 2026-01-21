import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type DeepResearchPerformanceEntry = {
  id: string;
  intent: string;
  samples: number;
  successCount: number;
  failureCount: number;
  avgDurationMs: number;
  lastDurationMs: number;
  lastStatus: "success" | "error";
  bestAvgDurationMs: number;
  bestLastDurationMs: number;
  createdAt: string;
  hash: string;
};

const LEDGER_DIR = path.resolve(process.cwd(), ".bickford-deep-research");
const PERFORMANCE_FILE = path.join(LEDGER_DIR, "performance.jsonl");

function ensureLedgerDir() {
  if (!fs.existsSync(LEDGER_DIR)) {
    fs.mkdirSync(LEDGER_DIR, { recursive: true });
  }
}

function hashEntry(entry: Omit<DeepResearchPerformanceEntry, "hash">) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(entry))
    .digest("hex");
}

export function appendDeepResearchPerformance(
  entry: Omit<DeepResearchPerformanceEntry, "hash">,
): DeepResearchPerformanceEntry {
  const hash = hashEntry(entry);
  const full = { ...entry, hash };
  ensureLedgerDir();
  fs.appendFileSync(PERFORMANCE_FILE, `${JSON.stringify(full)}\n`);
  return full;
}

export function readDeepResearchPerformance(intent: string) {
  if (!fs.existsSync(PERFORMANCE_FILE)) {
    return undefined;
  }

  const lines = fs
    .readFileSync(PERFORMANCE_FILE, "utf8")
    .split("\n")
    .filter(Boolean);

  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const entry = JSON.parse(lines[i]) as DeepResearchPerformanceEntry;
    if (entry.intent === intent) {
      return entry;
    }
  }

  return undefined;
}
