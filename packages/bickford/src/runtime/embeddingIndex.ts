import {
  EmbeddingIndexRecord,
  EmbeddingProvider,
  EmbeddingQueryOptions,
  EmbeddingQueryResult,
} from "./embeddingTypes";

type IndexStore = Record<string, EmbeddingIndexRecord[]>;

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function createInMemoryEmbeddingIndex(provider: EmbeddingProvider) {
  const store: IndexStore = {};

  async function indexSummary(
    record: Omit<EmbeddingIndexRecord, "embedding">
  ): Promise<EmbeddingIndexRecord> {
    const embedding = await provider(record.summary);
    const full: EmbeddingIndexRecord = { ...record, embedding };
    store[record.tenantId] ||= [];
    const records = store[record.tenantId];
    const existingIndex = records.findIndex((entry) => entry.id === record.id);
    if (existingIndex >= 0) {
      records[existingIndex] = full;
    } else {
      records.push(full);
    }
    return full;
  }

  async function querySimilar(
    tenantId: string,
    query: string,
    options: EmbeddingQueryOptions = {}
  ): Promise<EmbeddingQueryResult[]> {
    const embedding = await provider(query);
    const records = store[tenantId] ?? [];
    const limit = options.limit ?? 5;
    const minScore = options.minScore ?? Number.NEGATIVE_INFINITY;
    const requiredTags = options.requiredTags ?? [];

    return records
      .filter((record) => {
        if (requiredTags.length === 0) return true;
        const tags = record.metadata?.tags ?? [];
        return requiredTags.every((tag) => tags.includes(tag));
      })
      .map((record) => ({
        id: record.id,
        score: cosineSimilarity(embedding, record.embedding),
        record,
      }))
      .filter((result) => result.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  function getTenantRecords(tenantId: string) {
    return store[tenantId] ?? [];
  }

  return {
    indexSummary,
    querySimilar,
    getTenantRecords,
  };
}
