import type { MemoryLedger } from './memory-ledger';

type CanonConfig = {
  allowedModels: string[];
  maxTokensPerRequest: number;
  constitutionalConstraints: {
    noHarmfulContent: boolean;
    noPersonalData: boolean;
  };
};

type RagConfig = {
  enabled: boolean;
  maxHistoryItems: number;
  minSimilarity: number;
};

type ClientConfig = {
  apiKey: string;
  canon: CanonConfig;
  memoryLedger: MemoryLedger;
  rag: RagConfig;
};

export class RAGAnthropicClient {
  readonly apiKey: string;
  readonly canon: CanonConfig;
  readonly memoryLedger: MemoryLedger;
  readonly rag: RagConfig;

  constructor(config: ClientConfig) {
    this.apiKey = config.apiKey;
    this.canon = config.canon;
    this.memoryLedger = config.memoryLedger;
    this.rag = config.rag;
  }
}
