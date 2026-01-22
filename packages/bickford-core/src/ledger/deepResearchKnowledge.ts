import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type DeepResearchKnowledgeEntry = {
  id: string;
  intent: string;
  summary: string;
  sources?: string[];
  createdAt: string;
  hash: string;
};

const LEDGER_DIR = path.resolve(process.cwd(), ".bickford-deep-research");
const KNOWLEDGE_FILE = path.join(LEDGER_DIR, "knowledge.jsonl");

function ensureLedgerDir() {
  if (!fs.existsSync(LEDGER_DIR)) {
    fs.mkdirSync(LEDGER_DIR, { recursive: true });
  }
}

function hashEntry(entry: Omit<DeepResearchKnowledgeEntry, "hash">) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(entry))
    .digest("hex");
}

export function appendDeepResearchKnowledge(
  entry: Omit<DeepResearchKnowledgeEntry, "hash">,
): DeepResearchKnowledgeEntry {
  const hash = hashEntry(entry);
  const full = { ...entry, hash };
  ensureLedgerDir();
  fs.appendFileSync(KNOWLEDGE_FILE, `${JSON.stringify(full)}\n`);
  return full;
}

export function readDeepResearchKnowledge(intent: string) {
  if (!fs.existsSync(KNOWLEDGE_FILE)) {
    return undefined;
  }

  const lines = fs
    .readFileSync(KNOWLEDGE_FILE, "utf8")
    .split("\n")
    .filter(Boolean);

  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const entry = JSON.parse(lines[i]) as DeepResearchKnowledgeEntry;
    if (entry.intent === intent) {
      return entry;
    }
  }

  return undefined;
}
