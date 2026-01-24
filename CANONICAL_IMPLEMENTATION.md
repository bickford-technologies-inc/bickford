# OPTR Multi-Agent Executor — Canonical Implementation

This document verifies that the OPTR multi-agent executor implementation matches the canonical specification in `docs/technical/OPTR_MULTI_AGENT_EXECUTOR.md`.

## Canonical Flow Match

1. **Intent ingestion** → structured `IntentContext` with constraints and authority.
2. **Parallel execution** → four agent runners (Codex, Claude, Copilot, MS Copilot).
3. **Selection** → canonical OPTR scoring (admissibility + invariants + TTV + execution + preference).
4. **Ledger binding** → append-only JSONL ledger with SHA-256 hash chaining.
5. **π* execution** → only selected admissible result is used downstream.

## Data Layout Match

The executor persists to:

```
/datalake
  /workflows/<workflow>/intent.json
  /workflows/<workflow>/agents/<agentId>/result.json
  /ledger.jsonl
```

## Type Signature Match

- `IntentContext`
  - `workflow`
  - `intent`
  - `constraints[]`
  - `authority[]`
  - `timestamp`
- `AgentResult`
  - `admissible`
  - `invariants`
  - `ttv`
  - `executionTimeMs`
  - `preference`
- `AgentRunners`
  - `runCodex`, `runClaude`, `runCopilot`, `runMsCopilot`

## Orchestrator Signature Match

```ts
optrExecutor(context: IntentContext, runners: AgentRunners): Promise<OptrExecutorResult>
```

## Compliance Checklist

- ✅ Parallel agent execution
- ✅ Deterministic selection logic with admissibility gate
- ✅ Ledger hash chaining
- ✅ Git commit binding
- ✅ Datalake preservation
- ✅ π* selection exposed to runtime

## File Map

- `packages/optr/src/executor.ts`
- `packages/optr/cli/execute.js`
- `.github/workflows/optr.yml`
