# Bickford datalake workflow integration plan

## Objective

Enable Bickford chat to ingest a message, identify the intent keywords, search the datalake for the best matching workflow, and then execute, modify, or create a workflow folder when no match exists. The plan aligns to the Canonical Mathematical Formulation (intent, structural dominance, decision ledger, non-interference, and execution law) so every workflow decision is traceable and enforceable.

## Desired end-state behavior

1. **Message arrives in Bickford chat.**
2. **Keyword + intent extraction** produces a normalized set of workflow signals.
3. **Workflow discovery** queries the datalake index for matching workflows.
4. **Workflow decision** resolves to:
   - execute an existing workflow,
   - modify an existing workflow and re-index it, or
   - create a new workflow folder and register it.
5. **Decision ledger** records the decision and evidence.
6. **Execution** runs only if admissible under constraints.
7. **Observation** updates the datalake and structural encodings.

## Architectural blueprint

### 1) Datalake structure and schema (structural dominance)

Introduce a predictable workflow data layout in the datalake:

```
/datalake/workflows/<workflow_id>/
  metadata.json
  definition.yaml
  versions/
    <version_id>/definition.yaml
  evidence/
    <decision_id>.json
  artifacts/
    ...
```

**Required fields in `metadata.json`:**

- `workflow_id`, `name`, `keywords`, `intents`, `owners`
- `constraints` (Θ), `authority_set` (A)
- `status` (active, deprecated, draft)
- `last_updated`, `version`, `hash`
- `value_per_hour`, `risk_tier`, `non_interference_constraints`

**Required fields in `definition.yaml`:**

- canonical intent structure (G, Θ, A, τ)
- steps (ordered stages)
- admissible actions (E)
- data dependencies
- execution guardrails

**Indexes:**

- `workflow_index.jsonl` stored at `/datalake/indexes/` with keyword → workflow_id mappings.
- Optional vector index derived from workflow descriptions and intents for semantic search.

### 2) Keyword + intent extraction service

Pipeline for Bickford chat message:

1. **Normalize text** (lowercase, lemmatize, remove noise).
2. **Extract intents** (goal, constraints, authority signals).
3. **Extract keywords** (noun phrases, product names, compliance domains).
4. **Build an intent signature** for matching.

Output example:

```json
{
  "goal": "reduce onboarding time",
  "constraints": ["SOC2", "PII"],
  "keywords": ["onboarding", "verification", "KYC"],
  "authority": "customer-ops@",
  "timestamp": "2026-01-12T19:42:00Z"
}
```

### 3) Workflow discovery + ranking

**Query path:**

1. Exact keyword match against `workflow_index.jsonl`.
2. If below threshold, semantic retrieval from vector index.
3. Rank by:
   - intent similarity
   - constraint compatibility
   - authority compatibility
   - historical success rate / value-per-hour
   - recency and version stability

Return top candidates for decision formation.

### 4) Decision formation + admissibility

For each candidate workflow:

1. Validate **structural dominance** (workflow definition matches schema).
2. Validate **constraints** (Θ) and **authority set** (A).
3. Validate **non-interference** (no increase in other agents’ TTV).
4. If all pass, generate decision package (`I, R, E, σ`) and append to ledger.

If no candidate passes admissibility:

- Create a **new workflow proposal** folder in `/datalake/workflows/<workflow_id>/`.
- Store generated draft `metadata.json` and `definition.yaml` with status `draft`.
- Record a decision entry that execution is **denied** pending approval.

### 5) Workflow modification path

When an existing workflow requires modification:

1. Duplicate the current definition into `versions/<version_id>/definition.yaml`.
2. Apply modifications to the new version.
3. Update `metadata.json` with new `version`, `hash`, and `last_updated`.
4. Rebuild indexes and append a new ledger decision.

### 6) Execution + observation loop

- Execute only if `action ∈ E`, `σ ∈ A`, and `action ⊨ Θ`.
- Capture evidence to `/datalake/workflows/<workflow_id>/evidence/<decision_id>.json`.
- Write observations into `/datalake/workflows/<workflow_id>/artifacts/`.
- Update indexes and workflow metadata.

### 7) Governance + auditability

- **Ledger-first**: every workflow routing or modification emits a decision record.
- **Immutable evidence**: store decision hashes and evidence artifacts per workflow.
- **UI binding**: workflow execution surfaces must reference ledger hashes.

### 8) Operational safety and fallbacks

- If keyword extraction fails → route to a human review workflow.
- If datalake indexes unavailable → fall back to last known snapshot.
- If decision formation fails → generate a draft workflow and request approval.

## Integration points

1. **Chat intake** (Bickford chat)
2. **Keyword + intent extractor** (new service/module)
3. **Datalake workflow registry** (new storage + indexes)
4. **Decision ledger writer** (existing ledger pipeline)
5. **Execution orchestrator** (existing workflow runtime)

## Rollout phases

1. **Phase 1: Discovery-only**
   - Build datalake folder structure and indexes.
   - Run keyword extraction and ranking without execution.

2. **Phase 2: Read + execute**
   - Execute workflows when admissibility passes.
   - Record full decision ledger + evidence.

3. **Phase 3: Modify + create**
   - Enable automatic workflow modification and draft creation.
   - Require approval for new workflows before execution.

4. **Phase 4: Continuous compounding**
   - Use execution outcomes to improve ranking and intent extraction.

## Success criteria

- >90% of chat intents map to a workflow within 2 seconds.
- > 90% of chat intents map to a workflow within 2 seconds.
- 100% of workflow executions have ledger entries and evidence.
- No executed workflow violates authority, constraint, or non-interference rules.
- Decision continuity rate increases over time with re-used workflows.
