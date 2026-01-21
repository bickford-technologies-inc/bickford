# Bickford Chat — Architecture & Integration Model

## 0. First Principle (Authoritative)

**Bickford is not a chat app.**
It is a **Decision Continuity Runtime** that uses chat as an intent ingress surface.

Chat exists to:

- capture intent
- bind authority
- route execution
- preserve decisions over time

Everything else is downstream.

---

## 1. High-Level System Topology

```
Human
  ↓
Bickford Chat (UI / Command Surface)
  ↓
Intent Normalization + Authority Binding
  ↓
Model Orchestration Layer
  ├── ChatGPT 5.2 (reasoning, synthesis)
  ├── Claude Sonnet 4.5 (analysis, critique, safety)
  └── Codex Agent (execution, code, GitHub)
  ↓
Execution Law / OPTR
  ↓
Ledger (Decision + UI + Proofs)
  ↓
Replay / Audit / Export
```

There is **one environment**, **one agent identity**, **many capabilities**.

---

## 2. Bickford Chat (UI Layer)

### What It Is

- A **Codex-style command dock**, not conversational chat
- Persistent across all screens
- Single input surface for intent

### What It Is Not

- Not ephemeral
- Not multi-persona
- Not a free-form assistant

### Behavior

- Every submission is treated as **intent**
- Intent is immediately:
  1. normalized
  2. scoped
  3. bound to authority
  4. logged

### Visual Contract (Locked)

- Input text: `Ask bickford`
- Top-left: `bickford`
- No floating bubbles
- No UI mutation without ledger update

---

## 3. Intent Lifecycle (Deterministic)

### Step 1 — Capture

User enters text → **Intent Object**

```
Iₜ = {
  text,
  timestamp,
  actor,
  environment,
  constraints
}
```

### Step 2 — Authority Binding

Intent is cryptographically bound:

```
A(Iₜ) = sign_KMS(hash(Iₜ))
```

No execution proceeds without a valid authority proof.

---

## 4. Model Orchestration (5.2 / 4.5 / Codex)

### ChatGPT 5.2 — **Reasoning Engine**

Used for:

- intent clarification
- synthesis
- decomposition
- executive framing

Never executes code directly.

---

### Claude Sonnet 4.5 — **Analytical / Safety Engine**

Used for:

- counter-analysis
- critique
- failure mode detection
- regulatory and safety alignment

Claude does **not** mutate state.

---

### Codex Agent — **Execution Engine**

Fully integrated with:

- GitHub (repos, PRs, commits)
- GitHub Codespaces
- CI/CD (Vercel)

Codex is the **only actor** allowed to:

- modify code
- run scripts
- deploy artifacts

Codex executes **only** what survives OPTR + invariants.

---

## 5. OPTR (Optimal Path to Realization)

All candidate actions are scored:

```
[
\pi^* = \arg\min_{\pi}
\mathbb{E}[TTV(\pi)]
;\text{s.t.};
\begin{cases}
\text{Authority valid} \\
\text{Invariants hold} \\
\text{Non-interference} \\
\text{Risk \le R_{max}}
\end{cases}
]
```

If no admissible path exists → **no action**.

This is why Bickford does not “hallucinate execution.”

---

## 6. Ledger (System of Record)

The ledger stores:

- intent (raw + normalized)
- authority signature
- model contributions
- execution path
- UI hashes
- CSS token hashes
- outcomes
- timestamps

**Append-only. Immutable. Replayable.**

---

## 7. Decision Trace Viewer

### Purpose

- Human-readable replay of reality
- Auditor-grade evidence

### Capabilities

- before / after intent diff
- time-travel scrubber (hover only)
- step-by-step execution
- cryptographic proof per step

### Modes

- Operator (live)
- Investor (read-only replay)
- Auditor (export)

---

## 8. GitHub + Codex Integration

Codex operates as:

- single execution agent
- bound to repo
- bound to branch
- bound to CI rules

Actions:

- open PRs
- commit code
- run tests
- trigger Vercel deploy

Deploy is blocked unless:

- UI hash matches
- CSS hash matches
- Playwright snapshots pass
- ledger entry is written

---

## 9. Why This Architecture Matters

Most systems do this:

> Chat → Model → Output → Forgotten

Bickford does this:

> Intent → Authority → Execution → Memory → Replay → Reuse

That is **decision continuity**.

---

## 10. One-Sentence Summary (Canonical)

> **Bickford is a deterministic execution runtime where ChatGPT 5.2 reasons, Claude 4.5 critiques, Codex executes, and a ledger remembers — permanently.**
