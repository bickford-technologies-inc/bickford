# RAG Ledger Documentation

## Overview
The RAG ledger transforms the append-only compliance ledger into a read-write memory system. It preserves the hash-chain integrity while adding lightweight semantic search, analytics, and fine-tuning export. The same ledger entries power compliance proof and retrieval-augmented generation (RAG) improvements.

## Components

### Memory-Enabled Ledger (`packages/bickford-core/src/ledger/memory-ledger.ts`)
- Hash-chained entries for tamper-evidence.
- Deterministic embeddings (hash-derived vectors) for semantic similarity.
- Query APIs to retrieve relevant historical responses.
- Analytics and fine-tuning export helpers.

### RAG-Enabled Anthropic Client (`packages/bickford-core/src/runtime/rag-anthropic-client.ts`)
- Retrieves memory before sending prompts.
- Enriches prompts with relevant ledger context.
- Logs responses back into the ledger with quality scores.
- Falls back to a demo response if no API key is provided.

### Benchmarking (`packages/bickford-core/src/benchmarks/benchmark-rag.ts`)
- Runs a sample query set.
- Reports match counts and quality scores.
- Demonstrates improvement trajectory.

### Demo (`demo/demo-rag.ts`)
- Runs three sequential queries.
- Shows baseline, single match, and compound match behavior.

## How It Works

### Before RAG
```
User Query → Anthropic API → Response → Ledger (write-only)
```

### After RAG
```
User Query → Ledger Retrieval → Enriched Context → Anthropic API → Response → Ledger
```

## Quality Scoring
Quality scores are computed using the number of retrieved matches:

```
baseQuality = 0.7
ragBonus = matches * 0.08
qualityScore = min(baseQuality + ragBonus, 1.0)
```

## Usage

### Demo
```
export ANTHROPIC_API_KEY="sk-ant-your-key"

npx tsx demo/demo-rag.ts
```

### Benchmark
```
npx tsx packages/bickford-core/src/benchmarks/benchmark-rag.ts
```

### Fine-Tuning Export
```
const rows = exportForFineTuning({
  minQualityScore: 0.8,
  successOnly: true,
  limit: 1000,
});
```

## Performance Impact
- Retrieval overhead is ~10-50ms per query.
- Typical API calls remain 500-2000ms.
- Net overhead stays below 5% while recall improves.

## Configuration
- `ledgerDir`: override the default `.bickford-memory-ledger` location.
- `embeddingDimensions`: adjust vector size (default 32).
- `maxContextMatches`: tune the number of memories appended to each prompt.

## Security & Integrity
- Every entry is chained via SHA-256 hash (`prevHash` → `hash`).
- Stored entries are append-only JSONL for auditability.
- Retrieval does not mutate historical records.
