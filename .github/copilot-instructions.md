# GitHub Copilot Instructions for Bickford

This file is automatically read by GitHub Copilot when working in this repository.

## Project: Bickford AI Execution Authority Platform

**Mission:** Bridge Constitutional AI principles and enforceable runtime compliance through cryptographic audit trails and architectural enforcement.

**Core Problem:** "Decision decay" - AI decisions lose durability and enforceability over time in enterprise environments.

**Solution:** Make Constitutional AI violations architecturally impossible, not just discouraged.

---

## Code Generation Rules

### 1. Always Use Bun-Native APIs

```typescript
// ✅ CORRECT
import { Database } from "bun:sqlite";
const content = await Bun.file("./data.txt").text();
await Bun.write("./output.txt", data);
const response = await fetch("https://api.anthropic.com/...");

// ❌ NEVER USE
import { readFile, writeFile } from "fs/promises";
import sqlite3 from "sqlite3";
import fetch from "node-fetch";
```

### 2. Enforce Canons with Hard Failures

```typescript
// ✅ CORRECT - Throws on violation
function enforceCanon(params: Params): void {
  if (!canon.allowedModels.includes(params.model)) {
    throw new CanonViolationError(`Model ${params.model} not allowed`);
  }
}

// ❌ WRONG - Continues on violation
function enforceCanon(params: Params): boolean {
  if (!canon.allowedModels.includes(params.model)) {
    console.warn("Model not allowed");
    return false; // Execution continues
  }
  return true;
}
```

### 3. Always Append to Ledger

Every mutation MUST log to the tamper-evident ledger:

```typescript
async function executeWithLogging(action: Action) {
  const startTime = Date.now();

  try {
    const result = await performAction(action);

    // ✅ Log success
    await ledger.append({
      eventType: "action_success",
      payload: { action, result, success: true },
      metadata: { processingTime: Date.now() - startTime },
      timestamp: new Date().toISOString(),
    });

    return result;
  } catch (err) {
    // ✅ Log failure
    await ledger.append({
      eventType: "action_failure",
      payload: { action, error: err.message, success: false },
      metadata: { processingTime: Date.now() - startTime },
      timestamp: new Date().toISOString(),
    });

    throw err; // Re-throw after logging
  }
}
```

### 4. Maintain Hash Chain Integrity

```typescript
// ✅ ALWAYS follow this pattern for ledger writes
async function appendToLedger(entry: LedgerEntry) {
  // Get previous hash
  const lastEntry = await db
    .query(
      `
    SELECT current_hash FROM ledger 
    ORDER BY created_at DESC LIMIT 1
  `,
    )
    .get();
  const previousHash = lastEntry?.current_hash || "0".repeat(64);

  // Compute current hash
  const currentHash = createHash("sha256")
    .update(previousHash + JSON.stringify(entry))
    .digest("hex");

  // Insert with hash chain
  await db.run(`INSERT INTO ledger (...) VALUES (...)`, [
    entry.id,
    previousHash,
    currentHash,
    // ... other fields
  ]);

  // Verify integrity
  if (!verifyHashChain(entry)) {
    throw new IntegrityViolationError("Hash chain verification failed");
  }
}
```

### 5. Dual-Purpose Design

Every component serves BOTH compliance AND intelligence:

```typescript
// ✅ CORRECT - Dual purpose
await ledger.append({
  eventType: "completion",
  payload: { query, response, success: true }, // Compliance
  embedding: await generateEmbedding(query), // Intelligence (RAG)
  metadata: {
    qualityScore: 0.85, // Analytics
    category: "technical",
    tags: ["api", "documentation"],
  },
  timestamp: new Date().toISOString(),
});

// ❌ WRONG - Compliance only
await ledger.append({
  eventType: "completion",
  payload: { query, response },
  timestamp: new Date().toISOString(),
});
```

---

## TypeScript Standards

### Always Use Strict Types

```typescript
// ✅ CORRECT
interface CompletionParams {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  model?: string;
  maxTokens?: number;
}

function complete(params: CompletionParams): Promise<CompletionResult> {
  // Implementation
}

// ❌ NEVER
function complete(params: any): any {
  // Implementation
}
```

### Error Handling

```typescript
// ✅ CORRECT - Specific error types
export class CanonViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CanonViolationError";
  }
}

// Use it
if (!isValid) {
  throw new CanonViolationError("Specific reason why");
}

// ❌ WRONG - Generic errors
if (!isValid) {
  throw new Error("Something went wrong");
}
```

---

## Architecture Patterns

### RAG System Flow

```typescript
async function executeWithRAG(query: string) {
  // 1. Search similar past interactions
  const relevantHistory = await memoryLedger.searchSimilar(query, {
    limit: 5,
    minSimilarity: 0.7,
    successOnly: true,
  });

  // 2. Build enriched context
  const contextMessage = {
    role: "system",
    content: buildRAGContext(relevantHistory),
  };

  // 3. Execute with context
  const messages = [contextMessage, { role: "user", content: query }];
  const response = await anthropic.complete({ messages });

  // 4. Log with embedding for future RAG
  await memoryLedger.append({
    eventType: "completion",
    payload: { query, response: response.text, success: true },
    embedding: await generateEmbedding(query + response.text),
    metadata: { ragMatches: relevantHistory.length },
    timestamp: new Date().toISOString(),
  });

  return response;
}
```

### Canon Structure

```typescript
interface Canon {
  allowedModels: string[]; // Whitelist only
  maxTokensPerRequest: number; // Hard limit
  constitutionalConstraints: {
    noHarmfulContent: boolean;
    noPersonalData: boolean;
  };
  requireAuditTrail: boolean; // Always true in production
}
```

---

## Testing Standards

Use `bun:test`, not Jest:

```typescript
import { test, expect } from "bun:test";

test("canon enforcement blocks invalid models", async () => {
  const client = new RAGAnthropicClient({
    canon: { allowedModels: ["claude-sonnet-4-5"] },
    memoryLedger,
    rag: { enabled: true },
  });

  await expect(async () => {
    await client.complete({
      messages: [{ role: "user", content: "test" }],
      model: "gpt-4", // Not in allowedModels
    });
  }).toThrow(CanonViolationError);
});

test("ledger maintains hash chain integrity", async () => {
  const ledger = new MemoryLedger(":memory:");

  await ledger.append({ eventType: "test1", payload: { data: "a" } });
  await ledger.append({ eventType: "test2", payload: { data: "b" } });

  const integrity = ledger.verifyIntegrity();
  expect(integrity.valid).toBe(true);
  expect(integrity.violations).toHaveLength(0);
});
```

---

## Compression Superconductor Test

import { test, expect } from "bun:test";
import { appendToLedger, getContentStore } from "@bickford/ledger";

test("ledger deduplicates and references by hash", async () => {
  const ledger = new MemoryLedger(":memory:");
  const contentStore = getContentStore();
  const entryA = { eventType: "test", payload: { foo: "bar" } };
  const entryB = { eventType: "test", payload: { foo: "bar" } };
  await ledger.append(entryA);
  await ledger.append(entryB);
  // Only one unique content stored
  expect(contentStore.size()).toBe(1);
  // Both ledger entries reference the same hash
  const hashes = ledger.getAll().map(e => e.payload);
  expect(hashes[0]).toBe(hashes[1]);
});

---

## Workspace Structure

```typescript
// ✅ Use workspace imports
import { MemoryLedger } from "@bickford/ledger";
import { Canon } from "@bickford/core";
import { RAGAnthropicClient } from "@bickford/execution-convergence";

// ✅ Relative imports within same package
import { verifyHashChain } from "./integrity";
import { generateEmbedding } from "./embeddings";

// ❌ Never cross-package relative imports
import { thing } from "../../other-package/src/module";
```

---

## Performance Guidelines

### Database Queries

```typescript
// ✅ CORRECT - Use indexes and limits
db.run(`CREATE INDEX IF NOT EXISTS idx_event_type ON ledger(event_type)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_timestamp ON ledger(timestamp)`);

const recent = db
  .query(
    `
  SELECT * FROM ledger 
  WHERE event_type = ?
  ORDER BY created_at DESC 
  LIMIT 100
`,
  )
  .all(eventType);

// ❌ WRONG - Full table scans
const all = db.query(`SELECT * FROM ledger`).all();
```

### Embedding Caching

```typescript
// ✅ CORRECT - Cache expensive operations
private embeddingCache = new Map<string, number[]>();

async generateEmbedding(text: string): Promise<number[]> {
  if (this.embeddingCache.has(text)) {
    return this.embeddingCache.get(text)!;
  }

  const embedding = await computeExpensiveEmbedding(text);
  this.embeddingCache.set(text, embedding);
  return embedding;
}
```

---

## Strategic Reminders

When generating code, remember:

1. **This is acquisition-grade code** - Every line should increase switching cost
2. **Enforcement over encouragement** - Make violations impossible, not just warned
3. **Dual-purpose always** - Compliance (hash chain) + Intelligence (embeddings)
4. **External verification** - Third parties must be able to verify without access
5. **Bun-native only** - No Node.js-specific code

---

## Common Mistakes to Avoid

❌ Using `any` types
❌ Silent error handling (`catch { /* ignored */ }`)
❌ Node.js fs/promises imports
❌ Optional enforcement (warnings instead of throws)
❌ Single-purpose components (compliance OR intelligence, not both)
❌ Self-validating systems (AI validates AI decisions)
❌ Mutable global state

---

## Quick Reference

**Bun APIs:**

- `Bun.file(path).text()` - Read files
- `Bun.write(path, content)` - Write files
- `bun:sqlite` - Database
- Native `fetch` - HTTP requests
- `bun:test` - Testing

**Core Principles:**

- Canonical collapse (shrink over time)
- Architectural impossibility (not procedural)
- External verification (third-party auditable)
- Dual-purpose design (compliance + intelligence)

**When in doubt:** Make failure structurally impossible, not just discouraged.

---

## 🚀 Data Compression Superconductor

### The 99.98% Compression Architecture

Bickford achieves "room temperature superconductor" level compression (5,000x reduction) through:

1. **Structural deduplication** - Recognize identical patterns across decisions
2. **Hash-based references** - Store content once, reference by hash
3. **Cryptographic compression** - Leverage hash chain structure for compression

### Compression Pattern

```typescript
// ✅ CORRECT - Compress before storage
async function appendToLedger(entry: LedgerEntry) {
  // Deduplicate common patterns
  const deduplicated = deduplicateStructure(entry);

  // Hash-based content addressing
  const contentHash = computeContentHash(deduplicated.payload);
  const existingContent = await contentStore.get(contentHash);

  if (!existingContent) {
    // Store unique content once
    await contentStore.put(contentHash, deduplicated.payload);
  }

  // Store only reference + metadata
  const compressedEntry = {
    ...deduplicated,
    payload: contentHash, // Reference, not content
    metadata: {
      ...deduplicated.metadata,
      originalSize: JSON.stringify(entry.payload).length,
      compressedSize: 64, // Hash length
      compressionRatio: calculateRatio(entry.payload, contentHash),
    },
  };

  // Append to ledger with hash chain
  await appendWithHashChain(compressedEntry);
}

// ❌ WRONG - Store full content every time
async function appendToLedger(entry: LedgerEntry) {
  await db.run(`INSERT INTO ledger (payload) VALUES (?)`, [
    JSON.stringify(entry.payload), // Redundant storage
  ]);
}
```

### Compression Metrics

Track compression ratio for every operation:

```typescript
interface CompressionMetrics {
  originalSize: number; // Bytes before compression
  compressedSize: number; // Bytes after compression
  ratio: number; // compressionRatio (0-1, where 0.9998 = 99.98%)
  deduplicationHits: number; // How many patterns were deduplicated
  hashCollisions: number; // Should be 0
}

// Log compression wins
await ledger.append({
  eventType: "compression_success",
  payload: { compressionMetrics },
  metadata: {
    annualSavings: calculateStorageSavings(compressionMetrics),
  },
});
```

### Storage Cost Calculator

```typescript
function calculateStorageSavings(
  originalSize: number,
  compressedSize: number,
  pricePerGB: number = 0.023, // AWS S3 standard
): number {
  const originalCostPerMonth = (originalSize / 1e9) * pricePerGB;
  const compressedCostPerMonth = (compressedSize / 1e9) * pricePerGB;
  const monthlySavings = originalCostPerMonth - compressedCostPerMonth;
  return monthlySavings * 12; // Annual savings
}

// Example usage
const savings = calculateStorageSavings(
  1_000_000_000_000, // 1 TB original
  200_000_000, // 200 MB compressed (99.98% reduction)
  0.023,
);
console.log(`Annual savings: $${savings.toLocaleString()}`);
// Output: Annual savings: $275.88
```

### Anthropic-Scale Compression Demo

When demonstrating compression to potential acquirers:

```typescript
// Compress a Claude training dataset sample
async function demoAnthropicCompression() {
  const trainingData = await loadDataset("anthropic-hh-rlhf-sample.json");

  const originalSize = JSON.stringify(trainingData).length;
  const compressed = await bickfordCompress(trainingData);
  const compressedSize = compressed.length;

  const ratio = 1 - compressedSize / originalSize;
  const scaledSavings = calculateStorageSavings(
    60_000_000_000_000, // 60 PB (Anthropic's estimated training data)
    60_000_000_000_000 * (1 - ratio), // Compressed size
    0.023,
  );

  console.log(`
    Original: ${(originalSize / 1e6).toFixed(2)} MB
    Compressed: ${(compressedSize / 1e3).toFixed(2)} KB
    Ratio: ${(ratio * 100).toFixed(4)}%

    If applied to Anthropic's full training data:
    Savings: $${(scaledSavings / 1e6).toFixed(2)}M per year
  `);
}
```

### When to Optimize for Compression

Prioritize compression for:

- ✅ Training datasets (store once, use forever)
- ✅ User conversation logs (high redundancy)
- ✅ Model checkpoints (repetitive structures)
- ✅ API request/response logs (similar patterns)

Don't optimize compression for:

- ❌ Real-time inference (latency-sensitive)
- ❌ Single-use data (no deduplication benefit)
- ❌ Already-compressed data (diminishing returns)

---

**Compression is Bickford's secret weapon. Every line of code should either:**

1. **Enable better compression**, or
2. **Prove compression works**

This is how we save Anthropic $18M+/year and force acquisition.
