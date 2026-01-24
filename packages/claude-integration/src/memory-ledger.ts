export interface MemoryLedgerEntry {
  eventType: string;
  payload: {
    query?: string;
    response?: string;
    success?: boolean;
    [key: string]: unknown;
  };
  metadata?: {
    category?: string;
    qualityScore?: number;
    processingTime?: number;
    tags?: string[];
    [key: string]: unknown;
  };
  timestamp: string;
}

export interface MemoryLedgerSearchOptions {
  limit?: number;
  minSimilarity?: number;
  successOnly?: boolean;
  minQualityScore?: number;
  includeCategories?: string[];
}

export interface MemoryLedgerAnalytics {
  totalEntries: number;
  successRate: number;
  avgQualityScore: number;
}

export class MemoryLedger {
  private entries: MemoryLedgerEntry[] = [];

  async append(entry: MemoryLedgerEntry): Promise<void> {
    this.entries.push(entry);
  }

  async searchSimilar(
    query: string,
    options: MemoryLedgerSearchOptions = {}
  ): Promise<MemoryLedgerEntry[]> {
    const {
      limit = 5,
      minSimilarity = 0,
      successOnly = false,
      minQualityScore = 0,
      includeCategories,
    } = options;

    const scored = this.entries
      .map((entry) => ({
        entry,
        similarity: this.calculateSimilarity(query, entry.payload.query ?? ""),
      }))
      .filter(({ entry, similarity }) => {
        if (similarity < minSimilarity) return false;
        if (successOnly && entry.payload.success === false) return false;
        if ((entry.metadata?.qualityScore ?? 0) < minQualityScore) return false;
        if (
          includeCategories &&
          includeCategories.length > 0 &&
          entry.metadata?.category &&
          !includeCategories.includes(entry.metadata.category)
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => b.similarity - a.similarity);

    return scored.slice(0, limit).map(({ entry }) => entry);
  }

  getAnalytics(): MemoryLedgerAnalytics {
    const totalEntries = this.entries.length;
    if (totalEntries === 0) {
      return {
        totalEntries: 0,
        successRate: 0,
        avgQualityScore: 0,
      };
    }

    const successes = this.entries.filter((entry) => entry.payload.success !== false);
    const totalQuality = this.entries.reduce((sum, entry) => {
      return sum + (entry.metadata?.qualityScore ?? 0);
    }, 0);

    return {
      totalEntries,
      successRate: successes.length / totalEntries,
      avgQualityScore: totalQuality / totalEntries,
    };
  }

  exportForFineTuning(options?: {
    minQualityScore?: number;
    successOnly?: boolean;
    limit?: number;
  }): MemoryLedgerEntry[] {
    const {
      minQualityScore = 0,
      successOnly = false,
      limit,
    } = options ?? {};

    const filtered = this.entries.filter((entry) => {
      if ((entry.metadata?.qualityScore ?? 0) < minQualityScore) return false;
      if (successOnly && entry.payload.success === false) return false;
      return true;
    });

    if (limit && limit > 0) {
      return filtered.slice(0, limit);
    }

    return filtered;
  }

  private calculateSimilarity(query: string, candidate: string): number {
    if (!query || !candidate) return 0;

    const queryTokens = this.tokenize(query);
    const candidateTokens = this.tokenize(candidate);

    if (queryTokens.size === 0 || candidateTokens.size === 0) return 0;

    let intersection = 0;
    for (const token of queryTokens) {
      if (candidateTokens.has(token)) {
        intersection += 1;
      }
    }

    const union = new Set([...queryTokens, ...candidateTokens]).size;

    return union === 0 ? 0 : intersection / union;
  }

  private tokenize(text: string): Set<string> {
    return new Set(
      text
        .toLowerCase()
        .split(/\W+/)
        .filter(Boolean)
    );
  }
}
