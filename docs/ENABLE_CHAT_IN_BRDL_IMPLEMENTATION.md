# Enable Bickford Chat in BRDL — Implementation Guide

## Purpose

This guide operationalizes the closed-loop system where **Bickford Chat is the intent interface**, **GitHub is the intent realization engine**, and **BRDL is the canonical memory**. It aligns with the execution workflow and the canonical mathematical formulation by ensuring intent is structurally encoded, decisions are signed and logged, and execution only occurs through admissible policies and evidence capture. It does not execute code directly; it defines the deterministic pipeline Bickford resolves through. 

## Outcomes

- **Conversation capture** becomes structured, append-only data in BRDL (bronze → silver → gold).
- **Intent extraction** produces executable decisions with constraints and authority.
- **Agent orchestration** selects an admissible policy (OPTR) without violating non-interference.
- **GitHub realization** executes through the canonical build boundary and ledgered evidence.
- **Learning loop** upgrades structure and reduces time-to-value (TTV).
- **Max-extend TTV reduction** keeps the shortest admissible path active by preferring reusable decisions, precomputed policies, and deterministic evidence capture.

## Implementation Steps

### 1) Conversation Ingestion (Bronze)

**Goal:** Persist raw chat messages as immutable records.

**Artifacts:**
- `datalake/bronze/messages/<conversation_id>/<message_id>.json`

**Required fields:**
- `conversation_id`, `message_id`, `author`, `timestamp`, `content`, `source`, `hash`

**Invariant:** bronze is append-only. No mutation after write.

### 2) Intent Extraction (Silver)

**Goal:** Convert conversation artifacts into a structured intent (`I=(G,Θ,A,τ)`).

**Artifacts:**
- `datalake/silver/intents/<intent_id>.json`

**Required fields:**
- `goal`, `constraints`, `authority`, `timestamp`, `source_conversation`, `evidence_links`

**Invariant:** intent must be structurally encoded before any execution begins.

### 3) Decision Formation + Ledger Entry (Silver → Ledger)

**Goal:** Produce a decision (`D=(I,R,E,σ)`) and record it in the append-only ledger.

**Artifacts:**
- `datalake/silver/decisions/<decision_id>.json`
- `ledger/decisions.jsonl` (append-only)

**Required fields:**
- `intent_id`, `rationale`, `admissible_actions`, `authority_signature`, `hash`

**Invariant:** decision requires valid authority signature and ledger persistence.

### 4) Agent Orchestration (OPTR)

**Goal:** Choose the admissible policy that minimizes TTV without increasing other agents’ TTV.

**Artifacts:**
- `datalake/silver/optr/<intent_id>.json`

**Required fields:**
- `candidates`, `scores`, `selected_policy`, `non_interference_checks`

**Invariant:** policy selection must satisfy constraints and non-interference law.

**Max-extend TTV reduction:** persist OPTR scoring outputs so future intents can reuse the top policy without recomputation unless constraints drift.

### 5) GitHub Realization (Canonical Execution Boundary)

**Goal:** Realize intent via GitHub through the canonical build boundary, capturing evidence.

**Required execution path:**

```
pnpm run build:types
pnpm run prebuild
pnpm run realize-intent
pnpm run build
```

**Artifacts:**
- `trace/` and `artifacts/` outputs
- `execution-ledger.jsonl` updates
- `datalake/silver/realizations/<intent_id>.json`

**Invariant:** no execution without passing prebuild guards and authority validation.

### 6) Evidence Capture + Learning (Gold)

**Goal:** Persist evidence and update learned structure.

**Artifacts:**
- `datalake/gold/evidence/<intent_id>.json`
- `datalake/gold/playbooks/<pattern_id>.json`

**Invariant:** evidence is derived, not implemented; structure grows monotonically.

## Minimal Bootstrap Directory Layout

```
datalake/
├── bronze/
│   └── messages/
├── silver/
│   ├── intents/
│   ├── decisions/
│   ├── optr/
│   ├── realizations/
│   └── conversations/
└── gold/
    ├── evidence/
    └── playbooks/
ledger/
trace/
artifacts/
```

## Execution Checklist

1. **Conversation captured** in bronze.
2. **Intent structured** in silver.
3. **Decision signed** and appended to ledger.
4. **Policy selected** via OPTR with non-interference checks.
5. **Canonical build executed** with evidence captured.
6. **Learning updated** in gold.
7. **Max-extend TTV** by recording reusable decisions and policy outputs for fast reuse on similar intents.

## Governance Guardrails

- **Execution Law:** action is executable only if admissible, authorized, and constraint-compliant.
- **Structural Dominance:** knowledge has no effect unless structurally encoded.
- **Ledger Invariant:** no deletion, mutation, or reordering.

## Verification Commands

```
# Verify intent + decision state
ls datalake/silver/intents
ls datalake/silver/decisions

# Verify execution evidence
ls datalake/silver/realizations
ls datalake/gold/evidence

# Verify ledger continuity
tail -n 5 ledger/decisions.jsonl
```
