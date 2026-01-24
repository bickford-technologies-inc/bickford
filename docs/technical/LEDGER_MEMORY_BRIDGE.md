# Ledger → Memory Bridge (RAG Layer)

This document defines the end-to-end system that turns append-only ledger entries into
high-recall, policy-safe memory for agents and services. The goal is to **compound**
decision continuity by making verified outcomes retrievable and reusable, not just
stored. The bridge is intentionally **deterministic** (ledger is the source of truth),
**auditable** (every retrieval is traceable), and **non-interfering** (no mutation of
ledger facts during retrieval).

## Objectives

1. **Persisted evidence becomes recallable memory.**
2. **Retrieval is policy-gated** with canonical constraints.
3. **Every memory read is ledgered** for auditability.
4. **Memory quality compounds** via consistent embeddings + metadata filters.

## System Overview

```
Ledger (append-only) ──► Extract ▸ Normalize ▸ Embed ▸ Index ──► Vector Store
                               │                               │
                               └────────── Metadata ───────────┘

Query ─► Canon + Policy Gate ─► Embed Query ─► Retrieve ─► Rank ─► Answer
          │                                      │
          └──────────── Ledgered access ─────────┘
```

## Data Flow

### 1) Extract

**Source:** Ledger entries (e.g., `execution-ledger.jsonl` or database table).

**Fields to extract (minimum):**
- `ledger_id`
- `created_at`
- `intent`
- `decision.outcome`
- `decision.canonId`
- `configuration.fingerprint` (if present)
- `workspace_id` or tenant scope

### 2) Normalize

Convert entries into a consistent schema that is stable across versions:

```json
{
  "id": "ledger_123",
  "timestamp": "2026-01-06T04:00:00.000Z",
  "workspace_id": "ws_abc",
  "intent": "Add retry logic to API client",
  "decision": {
    "outcome": "ALLOW",
    "canon_id": "CANON-123"
  },
  "summary": "Approved intent to add retry logic to API client.",
  "tags": ["canon:CANON-123", "decision:ALLOW"]
}
```

**Guidance:**
- **Never** rewrite or discard ledger facts.
- Summaries should be derived from intent + decision only.

### 3) Embed

Produce embeddings from normalized entries.

**Input:** `summary` + `intent` + key tags.
**Output:** vector embedding + metadata payload.

### 4) Index

Store embeddings with metadata in a vector store.

**Minimum metadata fields:**
- `ledger_id`
- `workspace_id`
- `decision.outcome`
- `decision.canon_id`
- `created_at`

### 5) Retrieve

Query flow:
1. **Policy gate** query intent (non-interference, workspace access).
2. **Embed** query.
3. **Retrieve** top-k with metadata filters (workspace_id, allowed canon IDs).
4. **Rank** by recency + decision outcome + similarity.
5. **Ledger** the retrieval with query + result IDs.

## Governance & Safety

### Canon Gate

Apply canon constraints before retrieval:
- Block workspace-crossing queries.
- If canon requires constraints (e.g., HIPAA), enforce in filters.

### Retrieval Ledgering

Each retrieval is appended to the ledger to prove memory usage:

```json
{
  "type": "memory_retrieval",
  "query": "How did we enforce retry logic on API clients?",
  "workspace_id": "ws_abc",
  "result_ids": ["ledger_123", "ledger_456"],
  "timestamp": "2026-01-06T05:00:00.000Z"
}
```

## Minimal Implementation (Pseudo-code)

```ts
// 1) Extract + normalize
const normalized = ledgerEntries.map(toNormalizedLedgerDoc);

// 2) Embed + index
for (const doc of normalized) {
  const embedding = await embed(`${doc.summary}\n${doc.intent}`);
  await vectorStore.upsert({
    id: doc.id,
    embedding,
    metadata: {
      workspace_id: doc.workspace_id,
      canon_id: doc.decision.canon_id,
      outcome: doc.decision.outcome,
      created_at: doc.timestamp
    }
  });
}

// 3) Retrieve
const queryEmbedding = await embed(userQuery);
const results = await vectorStore.query({
  embedding: queryEmbedding,
  topK: 10,
  filter: { workspace_id: currentWorkspaceId }
});

// 4) Ledger retrieval
await ledger.append({
  type: "memory_retrieval",
  query: userQuery,
  workspace_id: currentWorkspaceId,
  result_ids: results.map((r) => r.id)
});
```

## Quality Signals

Track to ensure memory compounds without drift:
- **Recall rate** (retrieved entries used in answer).
- **Precision** (human verified).
- **Ledger coverage** (ratio of entries embedded).
- **Retrieval latency** (target < 100ms).

## Deployment Checklist

- [ ] Ledger export job (hourly/daily).
- [ ] Normalization contract tests.
- [ ] Embedding model version pinned.
- [ ] Vector store metadata filters enforced.
- [ ] Retrieval ledgering enabled.
- [ ] Canon gate for workspace + policy scopes.
