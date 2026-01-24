# Closed-Loop Implementation Guide — Ingestion to Verification

## Objective

Provide an implementation guide for the closed-loop execution system covering ingestion, intent/decision structuring, OPTR selection, canonical execution, evidence capture, and verification.

## 1) Ingestion (Bickford Chat → BRDL)

**Input:** user intent, constraints, authority signals.

**Steps:**
1. Normalize the intent into the canonical intent schema.
2. Bind authority (signature or identity proof).
3. Store the intent record in BRDL under the canonical schema.

**Output:** `intent.schema.json`-conformant record with hash.

## 2) Intent + decision structuring

**Input:** ingested intent + constraints + authority set.

**Steps:**
1. Validate constraints against canonical invariants.
2. Enumerate admissible actions (E).
3. Produce decision record:
   - rationale
   - admissible actions
   - authority signature
   - OPTR policy candidate list
4. Write decision to ledger and BRDL.

**Output:** `decision.schema.json`-conformant record.

## 3) OPTR selection (policy decision)

**Input:** decision candidate set, constraints, non-interference requirements.

**Steps:**
1. Score candidate policies for expected TTV, risk, and constraint adherence.
2. Apply non-interference checks and remove inadmissible paths.
3. Select `π*` and write selection metadata to the decision record.

**Output:** `decision.schema.json` with `optr_policy_id` and scoring metadata.

## 4) Canonical execution (GitHub boundary)

**Input:** OPTR-selected decision, execution boundary rules.

**Steps:**
1. Generate execution plan tied to GitHub actions (commit/PR/build).
2. Execute only within the boundary:
   - repository modifications
   - build + CI workflows
   - deployment artifacts
3. Log the GitHub run IDs and commit SHAs.

**Output:** `execution.schema.json` with `git_ref` + `workflow_run`.

## 5) Evidence capture (build + tests + logs)

**Input:** execution outputs, CI artifacts.

**Steps:**
1. Collect build, test, lint, and trace artifacts.
2. Generate checksums and store artifacts in BRDL.
3. Append evidence entries linked to the execution ID.

**Output:** `evidence.schema.json` entries for each artifact.

## 6) Verification (execution validity)

**Input:** evidence bundle + ledger references.

**Steps:**
1. Verify all required checks (schema validity, test pass, build artifacts).
2. Confirm evidence checksums and ledger hashes.
3. Store verification record in BRDL.
4. Emit verification summary to Chat and ledger.

**Output:** `verification.schema.json` record.

## 7) Feedback loop (closed-loop response)

**Input:** verification record + evidence summary.

**Steps:**
1. Respond to Chat with a proof bundle (intent, decision, execution, evidence, verification).
2. Surface any remaining knowledge gaps or next actions.
3. Promote validated knowledge into schemas and workflows.

**Output:** Chat response with audit-ready evidence bundle.

## Required directories (BRDL)

```
brdl/
  intents/
  decisions/
  executions/
  evidence/
  verifications/
  ledger/
  schemas/
```

## Minimal verification checklist

- Intent schema matches canonical definition.
- Decision contains authority signature + OPTR selection.
- Execution references GitHub run ID and commit.
- Evidence includes build + test artifacts.
- Verification is signed and persisted.

## Operational notes

- Never execute without a ledgered decision.
- All evidence is immutable and must include checksums.
- Verification failures must be recorded and surfaced back to Chat.
