# OPTR Multi-Agent Executor - Complete Integration Guide

## Quick Start

1. Install OPTR package (see README)
2. Configure environment variables (API keys, repo)
3. Run CLI or GitHub Actions workflow
4. Verify datalake and ledger
5. Commit and push

## Architecture Deep Dive

- Parallel agent execution (Codex, Claude, Copilot, MS Copilot)
- Output capture to datalake
- OPTR selection (admissibility + TTV + invariants)
- Ledger binding (append-only JSONL)
- GitHub commit binding
- Only π\* is executable

## Agent Responsibilities

- Codex: code generation
- Claude: constitutional validation
- Copilot: GitHub execution
- MS Copilot: business workflow

## Scoring

- Invariants (40%)
- TTV (30%)
- Execution (20%)
- Preference (10%)

## Example Workflows

- Code generation
- Validation
- GitHub ops
- Business workflow

## Deployment

- Copy files to `packages/optr/` and `.github/workflows/`
- Install dependencies
- Build and test
- Set environment variables
- Run CLI or workflow

## Compliance Integration

- SOC-2, ISO, NIST mapping
- Ledger verification
- Audit trail

## Troubleshooting

- No admissible results: relax constraints
- Ledger verification failed: backup and rebuild
- Agent timeout: increase timeout or simplify intent

**See CANONICAL_IMPLEMENTATION.md for proof of compliance.**
