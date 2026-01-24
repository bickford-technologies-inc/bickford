# OPTR Multi-Agent Executor - Architecture

## Overview

- Multi-agent execution authority: Codex, Claude, Copilot, MS Copilot
- Canonical flow: Intent → Parallel Execution → Output Capture → OPTR Selection → Ledger → Execute π\*
- Data layout: /datalake/workflows/{workflow}/agent-outputs/{agent}.json, /datalake/ledger.jsonl
- TypeScript orchestrator: optr-executor.ts
- CLI: optr-cli-execute.js
- GitHub Actions: optr-workflow.yml

## Data Flow

- Input: intent, constraints
- Parallel agent execution
- Output capture
- OPTR selection (scoring)
- Ledger + GitHub commit
- Only π\* is executable

## Agent Roles

- Codex: code generation
- Claude: constitutional validation
- Copilot: GitHub execution
- MS Copilot: business workflow

## Compliance

- SOC-2, ISO, NIST mapping
- Cryptographic audit trail
- Tamper-evident ledger

**See CANONICAL_IMPLEMENTATION.md for proof of compliance.**
