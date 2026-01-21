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

export type EmbeddingQuery = {
  tenantId: string;
  text: string;
  limit?: number;
};

export type EmbeddingProvider = (text: string) => Promise<number[]>;

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
