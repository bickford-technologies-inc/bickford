# Bickford Chat Workflows — Art of the Possible

This document defines the canonical chat workflows and the scope of outcomes Bickford can
realize. It complements the execution workflow and establishes a shared operating model for
intent, decisioning, execution, and evidence.

## Principles

- **Intent-first:** Every workflow begins with explicit intent and constraints.
- **Structure over memory:** Knowledge only affects outcomes when encoded in structure.
- **Evidence-driven:** Every execution step emits traceable artifacts.
- **Time-to-value:** The system optimizes for fastest validated realization.

## Workflow catalog

### 1) Intent capture → triage

**Trigger:** New user request, escalation, or automation signal.

**Inputs**
- Chat messages, uploads, or system events.

**Outputs**
- Draft intent specification (goal, constraints, authority, timestamp).
- Knowledge gaps list and required evidence.

**Datalake artifacts**
- `bronze/messages/`, `bronze/uploads/`, `silver/intents/`.

### 2) Knowledge gap closure

**Trigger:** Missing requirements, dependencies, or constraints.

**Inputs**
- Draft intent, existing schemas, prior decisions.

**Outputs**
- Clarified requirements, resolved constraints, and structured facts.

**Datalake artifacts**
- `silver/entities/`, `metadata/schemas/`, `metadata/contracts/`.

### 3) Decision authoring (Intent → Decision)

**Trigger:** Intent is fully defined with admissible actions.

**Inputs**
- Finalized intent, policy constraints, authority set.

**Outputs**
- Decision record with rationale, executable actions, signatures.

**Datalake artifacts**
- `ledger.jsonl`, `silver/decisions/`, `silver/policies/`.

### 4) Execution planning (Decision → Plan)

**Trigger:** Approved decision requiring coordinated execution.

**Inputs**
- Decision record and dependencies.

**Outputs**
- Sequenced execution plan with owners and checkpoints.

**Datalake artifacts**
- `silver/traces/`, `metadata/lineage/`.

### 5) Execution & tool invocation

**Trigger:** Plan is approved and authorized.

**Inputs**
- Execution plan, toolchain configuration, environment context.

**Outputs**
- Build artifacts, deployment outputs, runtime changes.

**Datalake artifacts**
- `evidence/builds/`, `evidence/tests/`, `evidence/compliance/`.

### 6) Observation & evidence capture

**Trigger:** Execution completes (success or failure).

**Inputs**
- Logs, test reports, runtime metrics.

**Outputs**
- Evidence package tied to the decision ledger entry.

**Datalake artifacts**
- `evidence/`, `gold/metrics/`, `gold/dashboards/`.

### 7) Learning & structural update

**Trigger:** Evidence yields new knowledge or corrections.

**Inputs**
- Observation outputs, postmortems, stakeholder feedback.

**Outputs**
- Updated schemas, policies, and canonical knowledge structures.

**Datalake artifacts**
- `metadata/schemas/`, `metadata/contracts/`, `silver/entities/`.

### 8) Replay & audit

**Trigger:** Compliance audit, debugging, or historical analysis.

**Inputs**
- Ledger entries, evidence artifacts, associated intent records.

**Outputs**
- Reproducible execution trail and audit summary.

**Datalake artifacts**
- `ledger.jsonl`, `evidence/`, `metadata/lineage/`.

### 9) Multi-agent handoff

**Trigger:** Workflow spans multiple agents or teams.

**Inputs**
- Decisions, policies, and shared context.

**Outputs**
- Authority-aware handoff package and shared evidence.

**Datalake artifacts**
- `interchange/`, `agents.json`, `silver/policies/`.

### 10) Incident response

**Trigger:** Runtime failure, security alert, or SLA breach.

**Inputs**
- Alert payloads, operational telemetry.

**Outputs**
- Containment plan, remediation decision, post-incident evidence.

**Datalake artifacts**
- `bronze/events/`, `silver/decisions/`, `evidence/`.

### 11) Continuous improvement loop

**Trigger:** Periodic review or value optimization.

**Inputs**
- KPIs, feedback, adoption metrics.

**Outputs**
- Updated playbooks, automation opportunities, backlog.

**Datalake artifacts**
- `gold/metrics/`, `gold/playbooks/`.

## Closed-loop workflows enabled by BRDL + GitHub execution

These workflows become possible with the closed-loop architecture that binds Bickford Chat,
BRDL schemas, OPTR selection, and GitHub execution into a single canonical boundary.

### 12) Chat → BRDL schema-conformant ingestion

**Trigger:** Intent declared in Chat with canonical schema requirements.

**Inputs**
- Chat intent payload, authority signals, referenced context.

**Outputs**
- `intent.schema.json`-conformant record with hash and authority binding.

**BRDL artifacts**
- `brdl/intents/`, `brdl/schemas/`, `ledger.jsonl`.

### 13) Intent → Decision → OPTR selection

**Trigger:** Intent is structurally valid and admissible candidates exist.

**Inputs**
- Intent record, constraints, admissible action set.

**Outputs**
- Decision record with OPTR policy selection and authority signature.

**BRDL artifacts**
- `brdl/decisions/`, `brdl/ledger/`, `brdl/schemas/`.

### 14) Decision-bound GitHub execution

**Trigger:** OPTR-selected decision passes execution boundary checks.

**Inputs**
- Decision record, GitHub execution plan, boundary rules.

**Outputs**
- GitHub commits/PRs tied to execution IDs and ledger hashes.

**BRDL artifacts**
- `brdl/executions/`, `brdl/ledger/`.

### 15) Evidence capture + verification loop

**Trigger:** GitHub execution completes or fails.

**Inputs**
- Build/test artifacts, run logs, trace outputs.

**Outputs**
- Evidence bundle and verification report with checksums.

**BRDL artifacts**
- `brdl/evidence/`, `brdl/verifications/`.

### 16) Execution denial + corrective intent

**Trigger:** OPTR or execution boundary rejects an action.

**Inputs**
- Denial reason, missing authority, failed constraint.

**Outputs**
- Recorded denial decision plus next-action intent for remediation.

**BRDL artifacts**
- `brdl/decisions/`, `brdl/ledger/`, `brdl/evidence/`.

### 17) Replayable audit packages

**Trigger:** Compliance review or post-incident verification.

**Inputs**
- Intent, decision, execution, evidence, verification chain.

**Outputs**
- Reconstructed audit bundle with hashes and provenance.

**BRDL artifacts**
- `brdl/ledger/`, `brdl/evidence/`, `brdl/verifications/`.

### 18) Schema evolution + workflow promotion

**Trigger:** Verified evidence reveals improved structures or invariants.

**Inputs**
- Verification outcomes, learned constraints, updated contracts.

**Outputs**
- Promoted schema updates and new workflow definitions.

**BRDL artifacts**
- `brdl/schemas/`, `brdl/decisions/`, `brdl/intents/`.

### 19) Closed-loop status reporting (Chat proof bundle)

**Trigger:** Verification completes or a knowledge gap is detected.

**Inputs**
- Evidence bundle, verification results, decision metadata.

**Outputs**
- Chat response with proof bundle + recommended next steps.

**BRDL artifacts**
- `brdl/verifications/`, `brdl/ledger/`.

## Art of the possible

Bickford chat can be used to:

- **Resolve intent to execution** with deterministic policy selection and audit trails.
- **Accelerate onboarding** by replaying canonical decisions and intent histories.
- **Drive compliance-ready automation** with immutable evidence bundles.
- **Enable multi-agent orchestration** with explicit authority boundaries.
- **Create domain-specific copilots** backed by structured, replayable knowledge.
- **Deliver near-real-time dashboards** on time-to-value, adoption, and operational health.
- **Support incident management** with structured decisions, playbooks, and evidence.
- **Power continuous learning** by promoting validated knowledge into schema updates.

## Data lake alignment

- Bronze → Silver → Gold promotion is gated by schema validation, decision authority, and
  evidence capture.
- Evidence artifacts are immutable and linked to the ledger for auditability.
- Metadata contracts define the schemas for every dataset that powers chat workflows.
