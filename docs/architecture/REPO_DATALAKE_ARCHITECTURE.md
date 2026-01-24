# Repo Datalake Architecture

## Purpose

Define the canonical datalake surface for Bickford so decisions, retained knowledge, and agent interchange artifacts are persisted deterministically in an append-only, shareable structure.

## Principles

- **Append-only**: ledger entries are never mutated, deleted, or reordered.
- **Monotonic structure**: schemas only grow; structural knowledge is never contracted.
- **Shared access**: all agents can read/import/export without mediation.
- **Minimal surface area**: no redundant pipelines, no sidecar logs, no siloed stores.

## Canonical Structure

```
/datalake/
  ledger.jsonl
  knowledge-schema.json
  agents.json
  /interchange/
    agent-<id>-import.json
    agent-<id>-export.json
```

### Ledger Lake (`/datalake/ledger.jsonl`)

Each line is a decision entry:

```json
{
  "decision": {
    "intent": "...",
    "rationale": "...",
    "executable_actions": ["..."],
    "signature": "..."
  },
  "hash": "h(D)",
  "timestamp": "t"
}
```

**Invariant**: append-only; no updates or deletes.

### Knowledge Lake (`/datalake/knowledge-schema.json`)

Structural schema of retained knowledge:

```json
{
  "state": {},
  "last_update": "t",
  "ledger_refs": ["h(D1)", "h(D2)"]
}
```

**Invariant**: monotonic growth; never contracts.

### Agent Lake (`/datalake/agents.json`)

Registry of agents and import/export references:

```json
[
  {
    "id": "agent-1",
    "type": "human|AI|system",
    "authority": true,
    "policy_refs": ["pi-1"],
    "active": true,
    "imported_knowledge": ["h(D1)"],
    "last_action": "t"
  }
]
```

### Interchange Lake (`/datalake/interchange/`)

Agent import/export files for multi-agent exchange:

```
/datalake/interchange/agent-<id>-import.json
/datalake/interchange/agent-<id>-export.json
```

## Flows

- **New decision**: append to `ledger.jsonl`; update `knowledge-schema.json` with new `ledger_refs`.
- **New knowledge**: update `knowledge-schema.json`; optionally emit to `interchange/agent-<id>-import.json`.
- **Agent export**: write `interchange/agent-<id>-export.json`.

## Governance

- Ledger entries are immutable and globally readable.
- Knowledge schema changes must be additive.
- Agents operate under the shared structure; no private ledgers or hidden state.

## Open Questions

- Do we want a canonical hash function for decision signatures?
- Should interchange files include versioned schemas or be free-form JSON?
