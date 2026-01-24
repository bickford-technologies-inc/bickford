# OPTR Architecture

## Multi-Agent Coordination

```
Intent → Parallel Agents → Selection (π*) → Ledger → Execution
```

Agents run in parallel, returning a structured `AgentResult` with admissibility, invariants, TTV, execution time, and preference scores.

## Data Flow

```
/datalake
  /workflows/<workflow>/intent.json
  /workflows/<workflow>/agents/<agentId>/result.json
  /ledger.jsonl
```

## Core Orchestrator

- `optrExecutor()` runs all agent runners concurrently.
- `canonicalSelectOptr()` selects the highest scoring admissible result.
- `recordInLedger()` appends cryptographically chained entries.
- `verifyLedger()` validates ledger integrity.
- `bindToGitHub()` binds to the current commit SHA.

## GitHub Actions Workflow

The workflow triggers on issue creation and manual dispatch, runs the OPTR executor, and stores artifacts for audit trails.

## Example Workflow Trace

1. Receive intent (workflow + constraints).
2. Execute four agents in parallel.
3. Select π* from admissible results.
4. Persist outputs + ledger entry.
5. Execute selected path only.
