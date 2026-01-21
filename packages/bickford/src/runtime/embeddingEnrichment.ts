export type EmbeddingRecord = {
  key: string;
  tenantId: string;
  embedding: number[];
  sourceFields: string[];
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type EmbeddingQueryMatch = {
  key: string;
  tenantId: string;
  score: number;
  metadata?: Record<string, unknown>;
};

export type EmbeddingInput = {
  tenantId: string;
  key: string;
  summary: string;
  sourceFields?: string[];
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

export type EmbeddingBatchInput = {
  tenantId: string;
  items: Array<{
    key: string;
    summary: string;
    sourceFields?: string[];
    metadata?: Record<string, unknown>;
    createdAt?: string;
  }>;
};

export type EmbeddingQuery = {
  tenantId: string;
  text: string;
  limit?: number;
};

export type EmbeddingKnowledgeSnapshot = {
  tenantId: string;
  query: string;
  retrieved: EmbeddingQueryMatch[];
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type EmbeddingPerformanceSnapshot = {
  tenantId: string;
  query: string;
  retrievedCount: number;
  averageScore: number;
  topScore: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type EmbeddingProvider = (text: string) => Promise<number[]>;

export type EmbeddingProviderBatch = (texts: string[]) => Promise<number[][]>;

export type EmbeddingVectorIndex = {
  upsert: (record: EmbeddingRecord) => Promise<void>;
  query: (params: {
    tenantId: string;
    embedding: number[];
    limit: number;
  }) => Promise<EmbeddingQueryMatch[]>;
};

const DEFAULT_SOURCE_FIELDS = ["summary"];

export function buildEmbeddingRecord(input: EmbeddingInput, embedding: number[]) {
  return {
    key: input.key,
    tenantId: input.tenantId,
    embedding,
    sourceFields: input.sourceFields ?? DEFAULT_SOURCE_FIELDS,
    createdAt: input.createdAt ?? new Date().toISOString(),
    metadata: input.metadata,
  } satisfies EmbeddingRecord;
}

export function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length) {
    throw new Error("Embedding vectors must be the same length.");
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function assertTenantScope(tenantId: string, recordTenantId: string) {
  if (tenantId !== recordTenantId) {
    throw new Error("Tenant scope mismatch for embedding operation.");
  }
}

export function createInMemoryVectorIndex() {
  const records = new Map<string, EmbeddingRecord>();
  return {
    async upsert(record: EmbeddingRecord) {
      records.set(record.key, record);
    },
    async query(params: { tenantId: string; embedding: number[]; limit: number }) {
      const matches: EmbeddingQueryMatch[] = [];
      for (const record of records.values()) {
        if (record.tenantId !== params.tenantId) {
          continue;
        }
        matches.push({
          key: record.key,
          tenantId: record.tenantId,
          score: cosineSimilarity(params.embedding, record.embedding),
          metadata: record.metadata,
        });
      }
      return matches.sort((a, b) => b.score - a.score).slice(0, params.limit);
    },
  } satisfies EmbeddingVectorIndex;
}

export async function enrichEmbedding(
  input: EmbeddingInput,
  provider: EmbeddingProvider,
  index: EmbeddingVectorIndex
) {
  const embedding = await provider(input.summary);
  const record = buildEmbeddingRecord(input, embedding);
  await index.upsert(record);
  return record;
}

export async function enrichEmbeddingsBatch(
  batch: EmbeddingBatchInput,
  provider: EmbeddingProviderBatch,
  index: EmbeddingVectorIndex
) {
  const embeddings = await provider(batch.items.map((item) => item.summary));
  const records: EmbeddingRecord[] = [];
  embeddings.forEach((embedding, idx) => {
    const item = batch.items[idx];
    const record = buildEmbeddingRecord(
      {
        tenantId: batch.tenantId,
        key: item.key,
        summary: item.summary,
        sourceFields: item.sourceFields,
        metadata: item.metadata,
        createdAt: item.createdAt,
      },
      embedding
    );
    records.push(record);
  });
  await Promise.all(records.map((record) => index.upsert(record)));
  return records;
}

export async function retrieveSimilarEmbeddings(
  query: EmbeddingQuery,
  provider: EmbeddingProvider,
  index: EmbeddingVectorIndex
) {
  const embedding = await provider(query.text);
  return index.query({
    tenantId: query.tenantId,
    embedding,
    limit: query.limit ?? 5,
  });
}

export function buildKnowledgeSnapshot(
  tenantId: string,
  query: string,
  retrieved: EmbeddingQueryMatch[],
  metadata?: Record<string, unknown>
): EmbeddingKnowledgeSnapshot {
  return {
    tenantId,
    query,
    retrieved,
    createdAt: new Date().toISOString(),
    metadata,
  };
}

export function buildPerformanceSnapshot(
  tenantId: string,
  query: string,
  retrieved: EmbeddingQueryMatch[],
  metadata?: Record<string, unknown>
): EmbeddingPerformanceSnapshot {
  const retrievedCount = retrieved.length;
  const scores = retrieved.map((match) => match.score);
  const averageScore =
    retrievedCount === 0
      ? 0
      : scores.reduce((sum, score) => sum + score, 0) / retrievedCount;
  const topScore = retrievedCount === 0 ? 0 : Math.max(...scores);
  return {
    tenantId,
    query,
    retrievedCount,
    averageScore,
    topScore,
    createdAt: new Date().toISOString(),
    metadata,
  };
}
