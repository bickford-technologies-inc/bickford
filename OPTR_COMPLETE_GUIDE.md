# OPTR Complete Guide

## Quick Start

```bash
pnpm --filter @bickford/optr build
node packages/optr/cli/execute.js \
  --workflow "test-canonical" \
  --intent "Test OPTR multi-agent executor" \
  --constraints "canonical,specification,compliant" \
  --output result.json
```

## Architecture Overview

The OPTR executor coordinates four authorities:

- **Codex**: generation authority
- **Claude**: constitutional validation authority
- **Copilot**: execution authority
- **MS Copilot (Stride)**: business workflow authority

### Selection Scoring

Scores are computed as:

```
Score = 0.4 * invariants
      + 0.3 * ttvScore
      + 0.2 * executionScore
      + 0.1 * preference
```

Admissibility is a hard gate. Only admissible results are eligible for π*.

## CLI Usage

```bash
node packages/optr/cli/execute.js \
  --workflow "my-workflow" \
  --intent "Implement user auth" \
  --constraints "security,audit" \
  --output result.json
```

### From a Context File

```bash
node packages/optr/cli/execute.js --context intent.json --output result.json
```

## Ledger Verification

Ledger entries are append-only JSONL with SHA-256 hash chaining. Each entry binds to the current Git commit hash if available.

## Compliance Alignment

The executor stores canonical artifacts:

- `intent.json`
- per-agent `result.json`
- `ledger.jsonl`

These artifacts satisfy audit requirements for SOC-2, ISO, and NIST through deterministic reconstruction.
