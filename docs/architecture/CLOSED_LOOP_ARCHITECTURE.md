# Closed-Loop Architecture — Bickford Chat ↔ BRDL ↔ GitHub Execution

## Objective

Define the closed-loop system that links Bickford Chat intent capture, BRDL (Bickford Runtime Data Lake), and GitHub execution into a single canonical execution boundary with auditable schemas.

## System loop (canonical)

```
Bickford Chat
  → Intent + Authority capture
  → BRDL ingestion + canonical schemas
  → OPTR policy selection + execution boundary checks
  → GitHub execution (commit/PR/CI)
  → Evidence capture (build, tests, logs)
  → BRDL verification + ledger binding
  ↺ Feedback to Chat (status, proof, next intent)
```

## Core components

### 1) Bickford Chat (intent ingress)
- Accepts user intent and constraints.
- Binds authority (who can act) and timestamps all declarations.
- Emits a canonical intent envelope into BRDL.

### 2) BRDL (Bickford Runtime Data Lake)
- Stores all canonical schemas and immutable evidence artifacts.
- Enforces structural dominance: only schema-conformant knowledge is actionable.
- Provides the ledger index that binds intent → decision → execution → evidence.

### 3) OPTR + Execution boundary
- Scores admissible policies and selects the optimal path to realization.
- Confirms execution law: action ∈ E, authority ∈ A, action ⊨ Θ.
- Hard boundary: only the selected OPTR path can execute.

### 4) GitHub execution surface
- Codex (or execution agent) executes only within GitHub boundaries:
  - commit, PR, CI, and build artifacts.
- Execution is canonical only when tied to a ledgered decision and evidence.

## Canonical schemas (minimal)

### Intent schema (`intent.schema.json`)
```json
{
  "intent_id": "uuid",
  "goal": "string",
  "constraints": ["string"],
  "authority": ["string"],
  "timestamp": "iso-8601",
  "source": "bickford_chat",
  "context_refs": ["uri"],
  "hash": "sha256"
}
```

### Decision schema (`decision.schema.json`)
```json
{
  "decision_id": "uuid",
  "intent_id": "uuid",
  "rationale": "string",
  "admissible_actions": ["string"],
  "optr_policy_id": "string",
  "authority_signature": "string",
  "timestamp": "iso-8601",
  "hash": "sha256"
}
```

### Execution schema (`execution.schema.json`)
```json
{
  "execution_id": "uuid",
  "decision_id": "uuid",
  "git_ref": "string",
  "workflow_run": "string",
  "status": "queued|running|succeeded|failed",
  "artifacts": ["uri"],
  "timestamp": "iso-8601",
  "hash": "sha256"
}
```

### Evidence schema (`evidence.schema.json`)
```json
{
  "evidence_id": "uuid",
  "execution_id": "uuid",
  "type": "build|test|lint|trace|log",
  "uri": "string",
  "checksum": "sha256",
  "timestamp": "iso-8601"
}
```

### Verification schema (`verification.schema.json`)
```json
{
  "verification_id": "uuid",
  "execution_id": "uuid",
  "checks": [{"name": "string", "status": "pass|fail"}],
  "verifier": "string",
  "timestamp": "iso-8601",
  "hash": "sha256"
}
```

## Execution boundary details

- **Boundary rule:** Only decisions with valid authority signatures and OPTR-selected policies can execute.
- **Artifact rule:** GitHub execution is canonical only if its evidence artifacts are stored in BRDL and referenced by ledger hashes.
- **Replay rule:** Replay requires intent → decision → execution → evidence chain integrity.

## Traceability model

1. Intent emitted from Chat → stored in BRDL.
2. Decision formed with OPTR selection → ledgered.
3. Execution performed in GitHub → run IDs stored.
4. Evidence captured → checksummed and stored in BRDL.
5. Verification runs → results stored and bound to ledger hash.
6. Chat receives proof bundle + next action recommendations.

## Failure handling

- Any schema violation → execution denied and recorded.
- Missing evidence → verification fails, execution marked invalid.
- Authority mismatch → decision cannot be admitted into the execution boundary.

## Outputs

- Canonical, auditable closed-loop flow.
- Deterministic boundary between intent and execution.
- Persistent evidence trail tying chat intent to GitHub execution.
