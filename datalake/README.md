# Canonical Datalake (Bickford Chat Brain)

The datalake is the canonical, append-only memory substrate for Bickford chat. It is designed
for deterministic replay, multi-agent knowledge import/export, and instantaneous retrieval.

## Core layout

- `ledger.jsonl`: append-only ledger of decisions, resolved intents, and canonical actions.
- `messages.jsonl`: append-only log of canonical chat messages.
- `knowledge-schema.json`: structured facts, invariants, and schemas derived from decisions.
- `agents.json`: registry of participating agents, authority, and policy snapshots.
- `interchange/`: per-agent import/export files for atomic knowledge exchange.

## Lakehouse zones

```
datalake/
  bronze/              # raw ingestion
  silver/              # normalized datasets
  gold/                # curated consumption-ready data
  metadata/            # schemas, contracts, lineage
  staging/             # transient processing outputs
  governance/          # access + retention policies
  evidence/            # immutable execution/test artifacts
```

Each zone contains focused subfolders with a README that defines intended contents and
promotion criteria.

## Usage flow

1. Append chat messages to `messages.jsonl`.
2. Append resolved decisions to `ledger.jsonl`.
3. Update `knowledge-schema.json` and `agents.json` with the resolved structure.
4. Exchange agent knowledge via `interchange/agent-{id}-import.json` and
   `interchange/agent-{id}-export.json`.
5. Promote datasets from `bronze/` → `silver/` → `gold/` when validation gates are met.
