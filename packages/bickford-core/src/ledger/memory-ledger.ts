import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type MemoryLedgerEntry = {
  id: string;
  ts: string;
  query: string;
  response: string;
  embedding: number[];
  qualityScore: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
  prevHash?: string;
  hash: string;
};

export type MemoryLedgerOptions = {
  ledgerDir?: string;
  embeddingDimensions?: number;
};

export type MemoryLedgerMatch = {
  entry: MemoryLedgerEntry;
  similarity: number;
};

export type MemoryLedgerAnalytics = {
  totalEntries: number;
  averageQualityScore: number;
  tagCounts: Record<string, number>;
};

export type FineTuningExportRow = {
  prompt: string;
  completion: string;
  qualityScore: number;
  metadata?: Record<string, unknown>;
};

const DEFAULT_LEDGER_DIR = path.resolve(
  process.cwd(),
  ".bickford-memory-ledger",
);

function resolveLedgerPath(options?: MemoryLedgerOptions) {
  const ledgerDir = options?.ledgerDir ?? DEFAULT_LEDGER_DIR;
  const ledgerFile = path.join(ledgerDir, "ledger.jsonl");
  return { ledgerDir, ledgerFile };
}

function ensureLedgerDir(ledgerDir: string) {
  if (!fs.existsSync(ledgerDir)) {
    fs.mkdirSync(ledgerDir, { recursive: true });
  }
}

function hashEntry(entry: Omit<MemoryLedgerEntry, "hash">) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(entry))
    .digest("hex");
}

export function generateEmbedding(
  text: string,
  dimensions: number = 32,
): number[] {
  const hash = crypto.createHash("sha256").update(text).digest();
  const vector = new Array<number>(dimensions);
  for (let i = 0; i < dimensions; i += 1) {
    const byte = hash[i % hash.length];
    vector[i] = byte / 127.5 - 1;
  }
  return vector;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function readMemoryLedger(
  options?: MemoryLedgerOptions,
): MemoryLedgerEntry[] {
  const { ledgerFile } = resolveLedgerPath(options);
  if (!fs.existsSync(ledgerFile)) {
    return [];
  }
  const content = fs.readFileSync(ledgerFile, "utf8");
  return content
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as MemoryLedgerEntry);
}

export function appendMemoryLedger(
  entry: Omit<MemoryLedgerEntry, "hash" | "id" | "ts" | "embedding" | "prevHash"> & {
    embedding?: number[];
  },
  options?: MemoryLedgerOptions,
): MemoryLedgerEntry {
  const { ledgerDir, ledgerFile } = resolveLedgerPath(options);
  ensureLedgerDir(ledgerDir);
  const entries = readMemoryLedger(options);
  const prevHash = entries.at(-1)?.hash;
  const embedding =
    entry.embedding ??
    generateEmbedding(`${entry.query}\n${entry.response}`, options?.embeddingDimensions);
  const fullEntry: MemoryLedgerEntry = {
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    query: entry.query,
    response: entry.response,
    embedding,
    qualityScore: entry.qualityScore,
    tags: entry.tags,
    metadata: entry.metadata,
    prevHash,
    hash: "",
  };
  const { hash: _hash, ...entryWithoutHash } = fullEntry;
  fullEntry.hash = hashEntry(entryWithoutHash);
  fs.appendFileSync(ledgerFile, `${JSON.stringify(fullEntry)}\n`);
  return fullEntry;
}

export function queryMemoryLedger(
  query: string,
  options?: MemoryLedgerOptions & { limit?: number; minSimilarity?: number },
): MemoryLedgerMatch[] {
  const entries = readMemoryLedger(options);
  const embedding = generateEmbedding(query, options?.embeddingDimensions);
  const matches = entries.map((entry) => ({
    entry,
    similarity: cosineSimilarity(embedding, entry.embedding),
  }));
  return matches
    .filter((match) =>
      options?.minSimilarity === undefined
        ? true
        : match.similarity >= options.minSimilarity,
    )
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, options?.limit ?? 5);
}

export function getMemoryAnalytics(
  options?: MemoryLedgerOptions,
): MemoryLedgerAnalytics {
  const entries = readMemoryLedger(options);
  const tagCounts: Record<string, number> = {};
  let totalQuality = 0;
  for (const entry of entries) {
    totalQuality += entry.qualityScore;
    for (const tag of entry.tags ?? []) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  return {
    totalEntries: entries.length,
    averageQualityScore: entries.length ? totalQuality / entries.length : 0,
    tagCounts,
  };
}

export function exportForFineTuning(
  options?: MemoryLedgerOptions & {
    minQualityScore?: number;
    successOnly?: boolean;
    limit?: number;
  },
): FineTuningExportRow[] {
  const entries = readMemoryLedger(options);
  const filtered = entries.filter((entry) => {
    if (
      options?.minQualityScore !== undefined &&
      entry.qualityScore < options.minQualityScore
    ) {
      return false;
    }
    if (options?.successOnly && entry.qualityScore < 0.8) {
      return false;
    }
    return true;
  });
  return filtered.slice(0, options?.limit ?? filtered.length).map((entry) => ({
    prompt: entry.query,
    completion: entry.response,
    qualityScore: entry.qualityScore,
    metadata: entry.metadata,
  }));
}
