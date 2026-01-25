# RAG Integration Guide

## Step 1: Add the Memory Ledger
Import the memory ledger utilities wherever you want to capture or query institutional memory.

```
import {
  appendMemoryLedger,
  queryMemoryLedger,
} from "packages/bickford-core/src/ledger/memory-ledger";
```

## Step 2: Use the RAG Client
Replace direct Anthropic calls with the `RagAnthropicClient` wrapper.

```
import { RagAnthropicClient } from "packages/bickford-core/src/runtime/rag-anthropic-client";

const client = new RagAnthropicClient({
  maxContextMatches: 5,
});

const completion = await client.complete("How does the ledger improve recall?");
```

## Step 3: Validate Outputs
1. Confirm ledger entries are written to `.bickford-memory-ledger/ledger.jsonl`.
2. Check that each entry includes `prevHash` and `hash`.
3. Ensure RAG matches are reported in the client response.

## Step 4: Run the Demo & Benchmark
```
export ANTHROPIC_API_KEY="sk-ant-your-key"

npx tsx demo/demo-rag.ts
npx tsx packages/bickford-core/src/benchmarks/benchmark-rag.ts
```

## Migration Strategies
- **Shadow mode:** Enable RAG retrieval but keep existing API path intact to compare outputs.
- **Gradual rollout:** Start with internal tenants or non-critical requests.
- **A/B test:** Compare quality scores and latency across RAG-enabled vs baseline.

## Troubleshooting
- **No matches:** Ensure the ledger has prior entries and queries are similar.
- **Low quality scores:** Increase `maxContextMatches` or adjust query prompts.
- **API failures:** Verify `ANTHROPIC_API_KEY` and network access.

## Rollback Plan
1. Stop using `RagAnthropicClient` and revert to direct API calls.
2. Keep the memory ledger in place for auditability.
3. Disable any scheduled benchmarks or exports.
