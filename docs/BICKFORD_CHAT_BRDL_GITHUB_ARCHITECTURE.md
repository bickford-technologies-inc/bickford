# Bickford Chat × BRDL × GitHub — Closed-Loop Architecture

## Summary

This architecture defines a closed-loop system where **Bickford Chat** is the intent interface, **GitHub** is the realization engine, and **BRDL** is the canonical memory. It embeds execution law, decision continuity, and structural dominance by ensuring every conversation is captured, every intent is structured, and every execution is governed by admissible policy selection and ledgered evidence. It also applies **max-extend TTV reduction** by reusing decisions and OPTR outputs to minimize time-to-value under admissible constraints.

## System Roles

- **Bickford Chat (Intent Interface):** captures declared objectives and constraints.
- **BRDL (Canonical Memory):** persists raw conversations, structured intents, decisions, and learning artifacts.
- **GitHub (Realization Engine):** executes admissible actions via canonical build boundaries and evidence capture.
- **Multi-Agent Orchestration (OPTR):** selects the optimal admissible policy with non-interference guarantees.

## Data Flow (Closed Loop)

```
Conversation → Bronze Capture → Intent (Silver) → Decision (Ledger) → OPTR Policy
→ GitHub Execution (Build Boundary) → Evidence → Learning (Gold) → Improved Policies
```

## Core Architecture Layers

### 1) Intent Interface (Chat)

**Responsibilities:**
- Capture all messages with authorship, timestamps, and hashes.
- Provide normalized conversation IDs for deterministic lineage.

**Outputs:**
- `datalake/bronze/messages/<conversation_id>/...`

### 2) Canonical Memory (BRDL)

**Bronze:** raw conversation artifacts (append-only).

**Silver:** structured artifacts (intents, decisions, policies, realizations).

**Gold:** evidence and learned playbooks.

**Invariant:** knowledge impacts execution only when structurally encoded.

### 3) Decision + Ledger

**Decision:** `D=(I,R,E,σ)` where authority signature (`σ`) is mandatory.

**Ledger:** append-only; no mutation or reordering.

**Outputs:**
- `ledger/decisions.jsonl`
- `execution-ledger.jsonl`

### 4) OPTR Policy Selection

**Objective:** minimize expected TTV under constraints.

**Non-Interference:** actions must not increase other agents’ expected TTV.

**Outputs:**
- `datalake/silver/optr/<intent_id>.json`

### 5) GitHub as Intent Realization Engine

**Canonical Execution Boundary:**

```
pnpm run build:types
pnpm run prebuild
pnpm run realize-intent
pnpm run build
```

**Evidence:** execution traces, artifacts, and ledger entries are stored as proof.

## Canonical BRDL Schemas (Minimum Fields)

### Conversation (Bronze)
- `conversation_id`, `message_id`, `author`, `timestamp`, `content`, `hash`

### Intent (Silver)
- `intent_id`, `goal`, `constraints`, `authority`, `timestamp`, `source_conversation`

### Decision (Silver + Ledger)
- `decision_id`, `intent_id`, `rationale`, `admissible_actions`, `authority_signature`, `hash`

### Policy (OPTR)
- `intent_id`, `candidates`, `scores`, `selected_policy`, `non_interference_checks`

### Realization (Silver)
- `intent_id`, `execution_summary`, `artifacts`, `evidence_links`, `timestamp`

### Evidence (Gold)
- `intent_id`, `ledger_refs`, `build_logs`, `artifact_hashes`, `compliance_snapshot`

## Evidence and Compliance

Evidence is derived from ledger, structure, policy, and signatures. Compliance emerges from the immutable audit trail and guardrail-enforced execution boundary.

## Operational Guarantees

- **Execution Law:** actions execute only with admissible authority and constraints.
- **Structural Dominance:** intent must be encoded before it can influence behavior.
- **Decision Continuity:** decisions are reused and compounded over time.
- **Max-extend TTV:** prefer reuse of prior decisions, cached policies, and evidence templates to reduce realization latency.
- **UI Binding:** runtime surfaces must hash-match ledgered design specs.

## Implementation Pointers

For implementation details, see:
- `docs/ENABLE_CHAT_IN_BRDL_IMPLEMENTATION.md`
- `docs/EXECUTION_WORKFLOW.md`
