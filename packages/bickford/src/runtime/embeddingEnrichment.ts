export type EmbeddingMetadata = Record<string, unknown> & {
  tags?: string[];
};

export type EmbeddingRecord = {
  key: string;
  tenantId: string;
  embedding: number[];
  sourceFields: string[];
  createdAt: string;
  metadata?: EmbeddingMetadata;
};

export type EmbeddingQueryMatch = {
  key: string;
  tenantId: string;
  score: number;
  metadata?: EmbeddingMetadata;
};

export type EmbeddingInput = {
  tenantId: string;
  key: string;
  summary: string;
  sourceFields?: string[];
  metadata?: EmbeddingMetadata;
  createdAt?: string;
};

export type EmbeddingBatchInput = {
  tenantId: string;
  items: Array<{
    key: string;
    summary: string;
    sourceFields?: string[];
    metadata?: EmbeddingMetadata;
    createdAt?: string;
  }>;
};

export type EmbeddingQuery = {
  tenantId: string;
  text: string;
  options?: EmbeddingQueryOptions;
};

export type EmbeddingQueryOptions = {
  limit?: number;
  minScore?: number;
  requiredTags?: string[];
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

export type EmbeddingKnowledgeGrowthSnapshot = {
  tenantId: string;
  query: string;
  retrievedCount: number;
  uniqueKeys: string[];
  newKeys: string[];
  repeatedKeys: string[];
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type EmbeddingKnowledgePersistenceSnapshot = {
  tenantId: string;
  query: string;
  persistedKeys: string[];
  persistedCount: number;
  destination: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type EmbeddingPeakPerformanceSnapshot = {
  tenantId: string;
  query: string;
  retrievedCount: number;
  averageScore: number;
  topScore: number;
  peakScore: number;
  peakKey?: string;
  deltaFromPreviousPeak: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type EmbeddingDynamicConfiguration = {
  tenantId: string;
  model: string;
  dimensions?: number;
  similarityThreshold?: number;
  limit?: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type EmbeddingDynamicConfigurationSnapshot = {
  tenantId: string;
  current: EmbeddingDynamicConfiguration;
  previous?: EmbeddingDynamicConfiguration;
  changedFields: string[];
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
    options?: EmbeddingQueryOptions;
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
  const records = new Map<string, Map<string, EmbeddingRecord>>();
  return {
    async upsert(record: EmbeddingRecord) {
      const tenantRecords =
        records.get(record.tenantId) ?? new Map<string, EmbeddingRecord>();
      tenantRecords.set(record.key, record);
      records.set(record.tenantId, tenantRecords);
    },
    async query(params: {
      tenantId: string;
      embedding: number[];
      options?: EmbeddingQueryOptions;
    }) {
      const matches: EmbeddingQueryMatch[] = [];
      const tenantRecords = records.get(params.tenantId);
      if (!tenantRecords) {
        return matches;
      }
      const requiredTags = params.options?.requiredTags ?? [];
      const minScore = params.options?.minScore;
      for (const record of tenantRecords.values()) {
        const score = cosineSimilarity(params.embedding, record.embedding);
        if (minScore !== undefined && score < minScore) {
          continue;
        }
        if (
          requiredTags.length > 0 &&
          !requiredTags.every((tag) =>
            Array.isArray(record.metadata?.tags)
              ? record.metadata?.tags?.includes(tag)
              : false
          )
        ) {
          continue;
        }
        matches.push({
          key: record.key,
          tenantId: record.tenantId,
          score,
          metadata: record.metadata,
        });
      }
      const limit = params.options?.limit ?? 5;
      return matches.sort((a, b) => b.score - a.score).slice(0, limit);
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
  index: EmbeddingVectorIndex,
  options?: EmbeddingQueryOptions
) {
  const embedding = await provider(query.text);
  const resolvedOptions = { ...query.options, ...options };
  return index.query({
    tenantId: query.tenantId,
    embedding,
    options: resolvedOptions,
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

export function buildKnowledgeGrowthSnapshot(
  tenantId: string,
  query: string,
  retrieved: EmbeddingQueryMatch[],
  previouslySeenKeys: string[] = [],
  metadata?: Record<string, unknown>
): EmbeddingKnowledgeGrowthSnapshot {
  const uniqueKeys = Array.from(new Set(retrieved.map((match) => match.key)));
  const previouslySeen = new Set(previouslySeenKeys);
  const newKeys = uniqueKeys.filter((key) => !previouslySeen.has(key));
  const repeatedKeys = uniqueKeys.filter((key) => previouslySeen.has(key));
  return {
    tenantId,
    query,
    retrievedCount: retrieved.length,
    uniqueKeys,
    newKeys,
    repeatedKeys,
    createdAt: new Date().toISOString(),
    metadata,
  };
}

export function buildKnowledgePersistenceSnapshot(
  tenantId: string,
  query: string,
  persistedKeys: string[],
  destination: string,
  metadata?: Record<string, unknown>
): EmbeddingKnowledgePersistenceSnapshot {
  return {
    tenantId,
    query,
    persistedKeys,
    persistedCount: persistedKeys.length,
    destination,
    createdAt: new Date().toISOString(),
    metadata,
  };
}

export function buildPeakPerformanceSnapshot(
  tenantId: string,
  query: string,
  retrieved: EmbeddingQueryMatch[],
  previousPeakScore = 0,
  metadata?: Record<string, unknown>
): EmbeddingPeakPerformanceSnapshot {
  const retrievedCount = retrieved.length;
  const scores = retrieved.map((match) => match.score);
  const averageScore =
    retrievedCount === 0
      ? 0
      : scores.reduce((sum, score) => sum + score, 0) / retrievedCount;
  const topScore = retrievedCount === 0 ? 0 : Math.max(...scores);
  const topMatch =
    retrievedCount === 0
      ? undefined
      : retrieved.reduce((best, current) =>
          current.score > best.score ? current : best
        );
  const peakScore = Math.max(previousPeakScore, topScore);
  return {
    tenantId,
    query,
    retrievedCount,
    averageScore,
    topScore,
    peakScore,
    peakKey: topMatch?.key,
    deltaFromPreviousPeak: peakScore - previousPeakScore,
    createdAt: new Date().toISOString(),
    metadata,
  };
}

export function buildDynamicConfiguration(
  tenantId: string,
  config: Omit<EmbeddingDynamicConfiguration, "tenantId" | "createdAt">,
  metadata?: Record<string, unknown>
): EmbeddingDynamicConfiguration {
  return {
    tenantId,
    model: config.model,
    dimensions: config.dimensions,
    similarityThreshold: config.similarityThreshold,
    limit: config.limit,
    createdAt: new Date().toISOString(),
    metadata: metadata ?? config.metadata,
  };
}

export function buildDynamicConfigurationSnapshot(
  current: EmbeddingDynamicConfiguration,
  previous?: EmbeddingDynamicConfiguration,
  metadata?: Record<string, unknown>
): EmbeddingDynamicConfigurationSnapshot {
  const trackedFields: Array<keyof EmbeddingDynamicConfiguration> = [
    "model",
    "dimensions",
    "similarityThreshold",
    "limit",
  ];
  const changedFields =
    previous === undefined
      ? trackedFields.map((field) => field.toString())
      : trackedFields
          .filter((field) => current[field] !== previous[field])
          .map((field) => field.toString());
  return {
    tenantId: current.tenantId,
    current,
    previous,
    changedFields,
    createdAt: new Date().toISOString(),
    metadata,
  };
}

export function applyDynamicConfiguration(
  query: EmbeddingQuery,
  config: EmbeddingDynamicConfiguration
): EmbeddingQuery {
  return {
    ...query,
    options: {
      ...query.options,
      limit: query.options?.limit ?? config.limit,
      minScore: query.options?.minScore ?? config.similarityThreshold,
    },
  };
}
