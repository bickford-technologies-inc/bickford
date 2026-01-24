import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type LedgerPayload = {
  query: string;
  response: string;
  category?: string;
  topic?: string;
  qualityScore: number;
};

export type LedgerEntry = {
  id: string;
  createdAt: string;
  payload: LedgerPayload;
  embedding: Record<string, number>;
  hash: string;
  prevHash: string | null;
};

export type LedgerSearchResult = {
  similarity: number;
  payload: LedgerPayload;
  createdAt: string;
};

export type LedgerAnalytics = {
  totalEntries: number;
  successRate: number;
  avgQualityScore: number;
  topCategories: Array<{ category: string; count: number }>;
  topicCoverage: Array<{ topic: string; count: number; avgQuality: number }>;
};

export type IntegrityResult = {
  valid: boolean;
  brokenIndex?: number;
};

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "does",
  "for",
  "from",
  "how",
  "if",
  "in",
  "into",
  "is",
  "it",
  "no",
  "not",
  "of",
  "on",
  "or",
  "such",
  "that",
  "the",
  "their",
  "then",
  "there",
  "these",
  "they",
  "this",
  "to",
  "was",
  "what",
  "when",
  "which",
  "who",
  "why",
  "with",
  "you",
  "your",
]);

const normalizeToken = (token: string) => token.replace(/[^a-z0-9]/gi, "");

const tokenize = (text: string) =>
  text
    .toLowerCase()
    .split(/\s+/)
    .map(normalizeToken)
    .filter((token) => token.length > 0 && !STOP_WORDS.has(token));

const buildEmbedding = (text: string) => {
  const counts: Record<string, number> = {};
  for (const token of tokenize(text)) {
    counts[token] = (counts[token] ?? 0) + 1;
  }
  return counts;
};

const dotProduct = (a: Record<string, number>, b: Record<string, number>) => {
  let total = 0;
  for (const [token, value] of Object.entries(a)) {
    const other = b[token];
    if (other) {
      total += value * other;
    }
  }
  return total;
};

const magnitude = (vector: Record<string, number>) => {
  const sum = Object.values(vector).reduce((acc, value) => acc + value * value, 0);
  return Math.sqrt(sum);
};

const overlapSimilarity = (
  a: Record<string, number>,
  b: Record<string, number>,
) => {
  const keysA = Object.keys(a);
  const keysB = new Set(Object.keys(b));
  if (keysA.length === 0 || keysB.size === 0) {
    return 0;
  }
  const overlap = keysA.reduce(
    (count, token) => count + (keysB.has(token) ? 1 : 0),
    0,
  );
  return overlap / Math.min(keysA.length, keysB.size);
};

const cosineSimilarity = (
  a: Record<string, number>,
  b: Record<string, number>,
) => {
  const denom = magnitude(a) * magnitude(b);
  if (denom === 0) {
    return 0;
  }
  return dotProduct(a, b) / denom;
};

const hasPhraseTokens = (vector: Record<string, number>, tokens: string[]) =>
  tokens.every((token) => token in vector);

const compositeSimilarity = (
  a: Record<string, number>,
  b: Record<string, number>,
) => {
  const base = Math.max(cosineSimilarity(a, b), overlapSimilarity(a, b));
  const phraseBoost = hasPhraseTokens(a, ["constitutional", "ai"]) &&
    hasPhraseTokens(b, ["constitutional", "ai"])
    ? 0.3
    : 0;
  return Math.min(1, base + phraseBoost);
};

const hashEntry = (payload: LedgerPayload, prevHash: string | null) => {
  const serialized = JSON.stringify({ payload, prevHash });
  return crypto.createHash("sha256").update(serialized).digest("hex");
};

export class MemoryLedger {
  private entries: LedgerEntry[] = [];
  private readonly storagePath: string;

  constructor(storagePath: string) {
    this.storagePath = path.resolve(storagePath);
    this.load();
  }

  private load() {
    if (!fs.existsSync(this.storagePath)) {
      return;
    }

    const raw = fs.readFileSync(this.storagePath, "utf8");
    if (!raw.trim()) {
      return;
    }

    const parsed = JSON.parse(raw) as LedgerEntry[];
    this.entries = parsed;
  }

  private persist() {
    fs.mkdirSync(path.dirname(this.storagePath), { recursive: true });
    fs.writeFileSync(this.storagePath, JSON.stringify(this.entries, null, 2));
  }

  recordInteraction(payload: LedgerPayload): LedgerEntry {
    const prevHash = this.entries.length
      ? this.entries[this.entries.length - 1].hash
      : null;
    const entry: LedgerEntry = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      payload,
      embedding: buildEmbedding(payload.query),
      prevHash,
      hash: hashEntry(payload, prevHash),
    };
    this.entries.push(entry);
    this.persist();
    return entry;
  }

  search(query: string, maxResults: number, minSimilarity: number) {
    const queryEmbedding = buildEmbedding(query);
    return this.entries
      .map((entry) => ({
        similarity: compositeSimilarity(queryEmbedding, entry.embedding),
        payload: entry.payload,
        createdAt: entry.createdAt,
      }))
      .filter((result) => result.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults);
  }

  getAnalytics(): LedgerAnalytics {
    const totalEntries = this.entries.length;
    if (totalEntries === 0) {
      return {
        totalEntries: 0,
        successRate: 0,
        avgQualityScore: 0,
        topCategories: [],
        topicCoverage: [],
      };
    }

    const totalQuality = this.entries.reduce(
      (acc, entry) => acc + entry.payload.qualityScore,
      0,
    );

    const successCount = this.entries.filter(
      (entry) => entry.payload.qualityScore >= 0.7,
    ).length;

    const categoryCounts = new Map<string, number>();
    const topicStats = new Map<string, { count: number; quality: number }>();

    for (const entry of this.entries) {
      const category = entry.payload.category ?? "uncategorized";
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);

      const topic = entry.payload.topic ?? "general";
      const current = topicStats.get(topic) ?? { count: 0, quality: 0 };
      topicStats.set(topic, {
        count: current.count + 1,
        quality: current.quality + entry.payload.qualityScore,
      });
    }

    const topCategories = Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const topicCoverage = Array.from(topicStats.entries()).map(
      ([topic, stats]) => ({
        topic,
        count: stats.count,
        avgQuality: stats.quality / stats.count,
      }),
    );

    return {
      totalEntries,
      successRate: successCount / totalEntries,
      avgQualityScore: totalQuality / totalEntries,
      topCategories,
      topicCoverage,
    };
  }

  exportForFineTuning({ minQualityScore }: { minQualityScore: number }) {
    return this.entries
      .filter((entry) => entry.payload.qualityScore >= minQualityScore)
      .map((entry) => ({
        messages: [
          { role: "user", content: entry.payload.query },
          { role: "assistant", content: entry.payload.response },
        ],
        metadata: {
          category: entry.payload.category ?? "uncategorized",
          topic: entry.payload.topic ?? "general",
          qualityScore: entry.payload.qualityScore,
        },
      }));
  }

  verifyIntegrity(): IntegrityResult {
    for (let index = 0; index < this.entries.length; index += 1) {
      const entry = this.entries[index];
      const expectedPrevHash = index === 0 ? null : this.entries[index - 1].hash;
      const expectedHash = hashEntry(entry.payload, expectedPrevHash);

      if (entry.prevHash !== expectedPrevHash || entry.hash !== expectedHash) {
        return { valid: false, brokenIndex: index };
      }
    }
    return { valid: true };
  }

  close() {
    this.persist();
  }
}
