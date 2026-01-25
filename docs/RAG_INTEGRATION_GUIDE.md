# RAG Integration Guide: Adding Memory to Existing Bickford

## Overview

This guide shows how to integrate the RAG (Retrieval-Augmented Generation) layer into your existing Bickford system.

**Timeline:** 2-4 hours  
**Difficulty:** Intermediate  
**Prerequisites:** Working Bickford installation, Anthropic API key

---

## Step 1: Install New Packages (5 minutes)

### 1.1 Copy RAG Files

```bash
# Create ledger package directory
mkdir -p packages/ledger/src

# Copy memory ledger
cp memory-ledger.ts packages/ledger/src/

# Copy RAG client
cp rag-anthropic-client.ts packages/execution-convergence/src/

# Copy demos/benchmarks
mkdir -p scripts/rag
cp benchmark-rag.ts scripts/rag/
cp demo-rag.ts scripts/rag/
```

### 1.2 Update package.json

```json
// packages/ledger/package.json
{
  "name": "@bickford/ledger",
  "version": "0.2.0",
  "main": "./src/index.ts",
  "dependencies": {
    "bun": "latest"
  },
  "scripts": {
    "test": "bun test"
  }
}
```

---

## Step 2: Update Existing Anthropic Adapter (15 minutes)

### 2.1 Backup Current Adapter

```bash
cp packages/execution-convergence/src/anthropic.ts \
   packages/execution-convergence/src/anthropic.backup.ts
```

### 2.2 Wrap Existing Adapter with RAG

```typescript
// packages/execution-convergence/src/anthropic.ts
import { MemoryLedger } from '@bickford/ledger/src/memory-ledger';
import { RAGAnthropicClient } from './rag-anthropic-client';

// Initialize memory ledger (singleton)
const memoryLedger = new MemoryLedger('./data/bickford-memory.db');

// Create RAG-enabled client
const ragClient = new RAGAnthropicClient({
  apiKey: Bun.env.ANTHROPIC_API_KEY || '',
  canon: {
    allowedModels: [
      'claude-opus-4-5',
      'claude-sonnet-4-5-20250929',
      'claude-haiku-4-5',
    ],
    maxTokensPerRequest: 4096,
    constitutionalConstraints: {
      noHarmfulContent: true,
      noPersonalData: true,
    },
  },
  memoryLedger,
  rag: {
    enabled: true, // Toggle to disable RAG
    maxHistoryItems: 5,
    minSimilarity: 0.7,
  },
});

// Export for existing code
export const anthropicClient = ragClient;

// Backward compatibility: Keep existing interface
export async function executeAnthropicQuery(query: string, options = {}) {
  return await ragClient.complete({
    messages: [{ role: 'user', content: query }],
    ...options,
  });
}
```

---

## Step 3: Enable RAG in Environment (2 minutes)

### 3.1 Update .env

```bash
# Add to .env
ANTHROPIC_API_KEY=sk-ant-your-key-here

# RAG Configuration
RAG_ENABLED=true
RAG_MAX_HISTORY_ITEMS=5
RAG_MIN_SIMILARITY=0.7

# Memory Ledger Path
MEMORY_LEDGER_PATH=./data/bickford-memory.db
```

### 3.2 Create Data Directory

```bash
mkdir -p data
```

---

## Step 4: Test Integration (10 minutes)

### 4.1 Quick Test

```bash
# Run demo
bun run scripts/rag/demo-rag.ts

# Expected output:
# ✓ Query 1: No RAG context (first query)
# ✓ Query 2: 1 RAG match (related to Query 1)
# ✓ Query 3: 2+ RAG matches (synthesis)
```

### 4.2 Integration Test with Existing Code

```typescript
// test/rag-integration.test.ts
import { anthropicClient } from '@bickford/execution-convergence/src/anthropic';
import { test, expect } from 'bun:test';

test('RAG integration works with existing code', async () => {
  const result = await anthropicClient.complete({
    messages: [
      { role: 'user', content: 'What is Constitutional AI?' },
    ],
  });

  expect(result.content[0].text).toBeDefined();
  expect(result.ragContext).toBeDefined(); // New field

  console.log('RAG matches:', result.ragContext?.length || 0);
});
```

---

## Step 5: Update CI/CD (5 minutes)

### 5.1 Add to GitHub Actions

```yaml
# .github/workflows/test.yml
- name: Test RAG System
  run: |
    bun test
    bun run scripts/rag/benchmark-rag.ts
```

### 5.2 Add to Pre-commit Hooks

```bash
#!/bin/sh
# .husky/pre-commit

# Verify ledger integrity
bun run scripts/verify-ledger-integrity.ts

# Run RAG tests
bun test packages/ledger
```

---

## Step 6: Migration Strategy (Choose One)

### Option A: Gradual Rollout (Recommended)

```typescript
// Enable RAG for specific users/features
const ragEnabled = Bun.env.RAG_ENABLED === 'true' ||
                   userFlags.includes('rag-beta');

const client = new RAGAnthropicClient({
  // ... config
  rag: {
    enabled: ragEnabled, // Gradual rollout
    maxHistoryItems: 5,
    minSimilarity: 0.7,
  },
});
```

### Option B: A/B Testing

```typescript
// 50/50 split for A/B testing
const ragEnabled = Math.random() < 0.5;

const client = new RAGAnthropicClient({
  // ... config
  rag: {
    enabled: ragEnabled,
    maxHistoryItems: 5,
    minSimilarity: 0.7,
  },
});

// Track metrics
if (ragEnabled) {
  trackMetric('rag_group', { quality: result.qualityScore });
} else {
  trackMetric('control_group', { quality: result.qualityScore });
}
```

### Option C: Full Deployment

```typescript
// Enable for all users immediately
const client = new RAGAnthropicClient({
  // ... config
  rag: {
    enabled: true,
    maxHistoryItems: 5,
    minSimilarity: 0.7,
  },
});
```

---

## Step 7: Monitoring & Observability (10 minutes)

### 7.1 Add Metrics Endpoint

```typescript
// packages/api/src/routes/metrics.ts
export async function getRAGMetrics(req, res) {
  const analytics = anthropicClient.getAnalytics();
  const recallMetrics = anthropicClient.getRecallMetrics();

  return {
    ledger: analytics,
    recall: recallMetrics,
    integrity: memoryLedger.verifyIntegrity(),
  };
}
```

### 7.2 Add Dashboard

```typescript
// apps/web/src/pages/analytics.tsx
export function RAGAnalyticsDashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetch('/api/metrics/rag')
      .then(res => res.json())
      .then(setMetrics);
  }, []);

  return (
    <div>
      <h2>RAG Performance</h2>
      <p>Total Entries: {metrics?.ledger.totalEntries}</p>
      <p>Success Rate: {(metrics?.ledger.successRate * 100).toFixed(1)}%</p>
      <p>Avg Quality: {metrics?.ledger.avgQualityScore.toFixed(2)}</p>
      <p>Recall Improvement: {metrics?.recall.estimatedImprovement}</p>
    </div>
  );
}
```

---

## Step 8: Verification Checklist

### Before Deployment

- [ ] RAG files copied to correct locations
- [ ] Dependencies installed (`bun install`)
- [ ] Environment variables set (.env)
- [ ] Data directory created
- [ ] Demo runs successfully
- [ ] Tests pass (`bun test`)
- [ ] Ledger integrity verified
- [ ] Monitoring dashboard working

### After Deployment

- [ ] RAG enabled in production
- [ ] First queries logged to ledger
- [ ] RAG matches appearing (after ~10 queries)
- [ ] Quality scores improving over time
- [ ] No performance degradation (<5% overhead)
- [ ] Ledger integrity maintained
- [ ] Analytics dashboard showing data

---

## Step 9: Execute the Workflow to Completion (End-to-End)

Use this sequence to run the full intent → decision → ledger → RAG loop with evidence captured at each step.

### 9.1 Prepare the Environment

```bash
pnpm install
mkdir -p data
```

### 9.2 Build and Guardrails

```bash
pnpm run build:types
pnpm run prebuild
pnpm run realize-intent
pnpm run build
```

### 9.3 Run RAG Demo (Evidence Capture)

```bash
bun run scripts/rag/demo-rag.ts
```

### 9.4 Verify Ledger Integrity

```bash
bun run scripts/verify-ledger.ts
```

### 9.5 Capture Evidence Bundle

Collect and store the following artifacts for audit and replay:

- Build logs from `pnpm run build`
- Guard outputs from `pnpm run prebuild`
- RAG demo output logs
- Ledger snapshot from `data/bickford-memory.db`

---

## Troubleshooting

### Issue: "Module not found: memory-ledger"

**Solution:**
```bash
# Verify file location
ls packages/ledger/src/memory-ledger.ts

# Rebuild
bun run build
```

### Issue: "Database locked"

**Solution:**
```bash
# One instance per database file
# Check for multiple processes accessing same DB

# Or use in-memory for dev
const ledger = new MemoryLedger(':memory:');
```

### Issue: "No RAG matches even with history"

**Solution:**
```typescript
// Lower similarity threshold
rag: {
  enabled: true,
  maxHistoryItems: 5,
  minSimilarity: 0.5, // Lower from 0.7
}
```

---

## Performance Tuning

### Optimize Database

```sql
-- Add after creating ledger
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = MEMORY;
```

### Optimize Embeddings

```typescript
// Use smaller dimensions for speed
private simpleHashEmbedding(text: string, dimensions: number = 256) {
  // Smaller = faster (256 vs 384)
}
```

### Optimize Search

```typescript
// Limit candidate pool for speed
const candidates = this.db.query(`
  SELECT * FROM memory_ledger
  WHERE ${whereClause}
  ORDER BY created_at DESC
  LIMIT 50  -- Reduce from 100 for speed
`).all(...params);
```

---

## Rollback Plan

If RAG causes issues, here's how to roll back:

### Quick Rollback (1 minute)

```typescript
// Disable RAG via environment
RAG_ENABLED=false

// Or in code
rag: {
  enabled: false, // Quick disable
  // ... rest of config
}
```

### Full Rollback (5 minutes)

```bash
# Restore backup
cp packages/execution-convergence/src/anthropic.backup.ts \
   packages/execution-convergence/src/anthropic.ts

# Rebuild
bun run build

# Redeploy
vercel --prod
```

### Preserve Data

```bash
# Ledger data is preserved even if RAG is disabled
# To backup:
cp data/bickford-memory.db data/bickford-memory-backup.db

# To restore:
cp data/bickford-memory-backup.db data/bickford-memory.db
```

---

## Next Steps After Integration

### Week 1: Monitoring
- Watch RAG match rates
- Track quality score trends
- Monitor performance overhead
- Check ledger integrity daily

### Week 2: Optimization
- Tune similarity thresholds
- Adjust maxHistoryItems
- Optimize database indexes
- Consider real embeddings

### Week 3: Analysis
- Compare with/without RAG
- Measure recall improvement
- Identify top topics
- Plan fine-tuning

### Month 2: Advanced Features
- Implement semantic embeddings
- Add topic-specific RAG
- Enable fine-tuning pipeline
- Scale to multiple models

---

## Support

If you encounter issues:

1. Check logs: `tail -f data/bickford.log`
2. Verify integrity: `bun run scripts/verify-ledger.ts`
3. Review analytics: `curl localhost:3000/api/metrics/rag`
4. Run benchmark: `bun run scripts/rag/benchmark-rag.ts`

---

## Summary

You've now integrated RAG into Bickford:

✅ **Compliance:** Hash-chained ledger (unchanged)  
✅ **Intelligence:** Semantic search (new)  
✅ **Improvement:** Compound learning (new)  
✅ **Verifiable:** Cryptographic proof (unchanged)

**Result:** AI that both proves governance AND learns from history.
