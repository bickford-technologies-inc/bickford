export type EmbeddingIndexRecord = {
  id: string;
  tenantId: string;
  createdAt: string;
  summary: string;
  embedding: number[];
  metadata?: Record<string, unknown> & { tags?: string[] };
};

export type EmbeddingQueryResult = {
  id: string;
  score: number;
  record: EmbeddingIndexRecord;
};

export type EmbeddingProvider = (input: string) => Promise<number[]>;

export type EmbeddingQueryOptions = {
  limit?: number;
  minScore?: number;
  requiredTags?: string[];
};
