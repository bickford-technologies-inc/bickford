import { createHash } from 'crypto';

export type LedgerEntry = {
  eventType: string;
  payload: Record<string, unknown>;
  metadata: {
    category?: string;
    qualityScore?: number;
    tags?: string[];
  };
  timestamp: string;
  hash: string;
  previousHash: string | null;
};

export type LedgerAnalytics = {
  totalEntries: number;
  successRate: number;
  topicCoverage: Array<{ topic: string; count: number; avgQuality: number }>;
};

export class MemoryLedger {
  private readonly entries: LedgerEntry[] = [];
  private readonly storageId: string;

  constructor(storageId: string) {
    this.storageId = storageId;
  }

  async append(entry: Omit<LedgerEntry, 'hash' | 'previousHash'>): Promise<LedgerEntry> {
    const previousHash = this.entries.length > 0 ? this.entries[this.entries.length - 1].hash : null;
    const hash = this.computeHash(entry, previousHash);
    const storedEntry: LedgerEntry = {
      ...entry,
      hash,
      previousHash,
    };
    this.entries.push(storedEntry);
    return storedEntry;
  }

  async searchSimilar(
    query: string,
    options: { limit: number; minSimilarity: number; successOnly?: boolean }
  ): Promise<LedgerEntry[]> {
    const normalizedQuery = tokenize(query);
    const scored = this.entries
      .filter(entry => {
        if (!options.successOnly) return true;
        return Boolean(entry.payload?.success);
      })
      .map(entry => ({
        entry,
        similarity: jaccardSimilarity(normalizedQuery, tokenize(String(entry.payload?.query ?? ''))),
      }))
      .filter(result => result.similarity >= options.minSimilarity)
      .sort((a, b) => b.similarity - a.similarity);

    return scored.slice(0, options.limit).map(result => result.entry);
  }

  getAnalytics(): LedgerAnalytics {
    const totalEntries = this.entries.length;
    const successful = this.entries.filter(entry => Boolean(entry.payload?.success));
    const successRate = totalEntries === 0 ? 0 : successful.length / totalEntries;

    const topicMap = new Map<string, { count: number; totalQuality: number }>();
    for (const entry of this.entries) {
      const topic = entry.metadata.category ?? 'uncategorized';
      const qualityScore = entry.metadata.qualityScore ?? 0;
      const existing = topicMap.get(topic) ?? { count: 0, totalQuality: 0 };
      existing.count += 1;
      existing.totalQuality += qualityScore;
      topicMap.set(topic, existing);
    }

    const topicCoverage = Array.from(topicMap.entries()).map(([topic, stats]) => ({
      topic,
      count: stats.count,
      avgQuality: stats.count === 0 ? 0 : stats.totalQuality / stats.count,
    }));

    return {
      totalEntries,
      successRate,
      topicCoverage,
    };
  }

  verifyIntegrity(): { valid: boolean; violations: string[] } {
    const violations: string[] = [];
    for (let i = 0; i < this.entries.length; i += 1) {
      const entry = this.entries[i];
      const expectedPrevious = i === 0 ? null : this.entries[i - 1].hash;
      if (entry.previousHash !== expectedPrevious) {
        violations.push(`Entry ${i} previousHash mismatch`);
      }
      const recomputedHash = this.computeHash(
        {
          eventType: entry.eventType,
          payload: entry.payload,
          metadata: entry.metadata,
          timestamp: entry.timestamp,
        },
        entry.previousHash
      );
      if (recomputedHash !== entry.hash) {
        violations.push(`Entry ${i} hash mismatch`);
      }
    }
    return { valid: violations.length === 0, violations };
  }

  private computeHash(
    entry: Omit<LedgerEntry, 'hash' | 'previousHash'>,
    previousHash: string | null
  ): string {
    const payload = JSON.stringify({
      storageId: this.storageId,
      entry,
      previousHash,
    });
    return createHash('sha256').update(payload).digest('hex');
  }
}

function tokenize(value: string): Set<string> {
  return new Set(
    value
      .toLowerCase()
      .split(/\W+/)
      .map(token => token.trim())
      .filter(Boolean)
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) intersection += 1;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
