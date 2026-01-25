# Bickford Custom Instructions for Codex/GitHub Copilot

## Project Overview

**Project:** Bickford - AI Execution Authority Platform
**Mission:** Bridge Constitutional AI principles and enforceable runtime compliance
**Core Problem:** "Decision decay" - AI decisions lose durability over time
**Solution:** Cryptographic audit trails + enforcement canons + institutional memory

## Architecture Principles

### 1. Enforcement, Not Enthusiasm
```typescript
// ❌ BAD: Hopeful enforcement
if (shouldEnforce) {
  try {
    enforce();
  } catch {
    console.log("Enforcement failed, continuing anyway");
  }
}

// ✅ GOOD: Architectural impossibility
function execute(params: Params): Result {
  enforceCanon(params); // Throws on violation - execution STOPS
  return doExecution(params);
}
```

**Principle:** Make violations structurally impossible, not just discouraged.

### 2. Canonical Collapse
```typescript
// ✅ Systems become SMALLER and more deterministic over time
interface Canon {
  allowedModels: string[];        // Shrinks as we standardize
  maxTokens: number;              // Fixed limit
  constraints: Constraint[];      // Immutable rules
}

// ❌ NOT expanding configuration that grows over time
```

**Principle:** Reduce degrees of freedom, don't add them.

### 3. Identity = Execution Authority
```typescript
// ✅ API key IS the canon
interface APIKey {
  key: string;
  canon: Canon;  // Inseparable
  ledgerPath: string;
}

// ❌ NOT separate authentication and authorization
```

**Principle:** Who you are = what you can do.

### 4. External Verification Anchors
```typescript
// ✅ Third parties can verify without access
const certificate = {
  ledgerHash: "3e700237...",
  timestamp: "2026-01-25T...",
  signature: signWithPrivateKey(ledgerHash)
};
// Verifiers check signature with public key

// ❌ NOT self-validation
```

**Principle:** AI systems can't validate themselves.

---

## Code Style & Standards

### TypeScript

**Always use:**
```typescript
// Strict types
interface MemoryLedgerEntry {
  id: string;
  eventType: string;
  previousHash: string;
  currentHash: string;
  payload: {
    query: string;
    response: string;
    success: boolean;
  };
  timestamp: string;
}

// Functional patterns
const enrichedContext = relevantHistory
  .map(entry => formatForContext(entry))
  .join('\n\n');

// Explicit error handling
if (!canon.allowedModels.includes(model)) {
  throw new CanonViolationError(`Model ${model} not allowed`);
}
```

**Never use:**
```typescript
// ❌ any types
function process(data: any) { ... }

// ❌ Silent failures
try { enforce(); } catch { /* ignored */ }

// ❌ Mutable state without reason
let globalState = {}; // Avoid
```

### Bun-Native Patterns

**Always prefer:**
```typescript
// ✅ Bun.file() for file operations
const content = await Bun.file('./data.txt').text();
await Bun.write('./data.txt', newContent);

// ✅ bun:sqlite for databases
import { Database } from 'bun:sqlite';
const db = new Database('./ledger.db');

// ✅ Native fetch (no imports needed)
const response = await fetch('https://api.anthropic.com/...');
```

**Never use:**
```typescript
// ❌ Node.js fs modules
import { readFile, writeFile } from 'fs/promises';

// ❌ Node.js specific packages
import sqlite3 from 'sqlite3';
import nodeFetch from 'node-fetch';
```

### Ledger Operations

**Pattern for all ledger writes:**
```typescript
async function appendToLedger(
  eventType: string,
  payload: unknown
): Promise<LedgerEntry> {
  // 1. Get previous hash
  const lastEntry = await getLastEntry();
  const previousHash = lastEntry?.currentHash || '0'.repeat(64);
  
  // 2. Create entry
  const entry = {
    id: crypto.randomUUID(),
    eventType,
    previousHash,
    payload,
    timestamp: new Date().toISOString(),
  };
  
  // 3. Compute current hash
  const currentHash = createHash('sha256')
    .update(previousHash + JSON.stringify(entry))
    .digest('hex');
  
  // 4. Store with hash
  await db.run(`
    INSERT INTO ledger (id, event_type, previous_hash, current_hash, payload, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [entry.id, entry.eventType, entry.previousHash, currentHash, 
      JSON.stringify(entry.payload), entry.timestamp]);
  
  return { ...entry, currentHash };
}
```

### RAG System Patterns

**Always structure RAG retrieval like this:**
```typescript
async function executeWithMemory(query: string) {
  // 1. Generate embedding
  const queryEmbedding = await generateEmbedding(query);
  
  // 2. Search similar
  const relevantHistory = await memoryLedger.searchSimilar(query, {
    limit: 5,
    minSimilarity: 0.7,
    successOnly: true,
  });
  
  // 3. Build context
  const contextMessage = {
    role: 'system',
    content: buildRAGContext(relevantHistory),
  };
  
  // 4. Enrich and execute
  const messages = [contextMessage, { role: 'user', content: query }];
  const response = await anthropic.complete({ messages });
  
  // 5. Log to ledger
  await memoryLedger.append({
    eventType: 'completion',
    payload: { query, response: response.text, success: true },
    metadata: { ragMatches: relevantHistory.length },
    timestamp: new Date().toISOString(),
  });
  
  return response;
}
```

---

## Component Architecture

### Package Structure

```
bickford/
├── packages/
│   ├── core/              # Core types and utilities
│   ├── ledger/            # Ledger + RAG system
│   │   ├── src/
│   │   │   ├── memory-ledger.ts    # Main ledger with RAG
│   │   │   ├── store.ts            # Persistence layer
│   │   │   └── integrity.ts        # Hash chain verification
│   ├── agents/            # AI execution logic
│   ├── credential-authority/  # API key management
│   └── execution-convergence/ # Intent → execution
├── apps/
│   └── web/              # Next.js frontend
└── scripts/              # Build and migration tools
```

### Import Patterns

```typescript
// ✅ Workspace imports
import { MemoryLedger } from '@bickford/ledger';
import { Canon } from '@bickford/core';

// ✅ Relative imports within package
import { verifyIntegrity } from './integrity';

// ❌ Avoid cross-package relative imports
import { something } from '../../other-package/src/thing';
```

---

## Key Concepts to Remember

### 1. Constitutional Canons
```typescript
interface Canon {
  allowedModels: string[];           // Whitelist only
  maxTokensPerRequest: number;       // Hard limit
  constitutionalConstraints: {
    noHarmfulContent: boolean;
    noPersonalData: boolean;
  };
  requireAuditTrail: boolean;        // Always true for production
}
```

### 2. Memory-Enabled Ledger
```typescript
interface MemoryLedgerEntry {
  // Compliance layer
  id: string;
  previousHash: string;
  currentHash: string;
  
  // Intelligence layer
  embedding?: number[];              // Vector for RAG
  
  // Metadata layer
  metadata: {
    category?: string;
    qualityScore?: number;
    tags?: string[];
  };
}
```

### 3. Dual-Purpose Design
Every component serves BOTH:
- **Compliance:** Tamper-evident audit trail
- **Intelligence:** Memory and learning capability

```typescript
// ✅ Dual-purpose append
await ledger.append({
  eventType: 'completion',
  payload: { query, response },      // Compliance
  embedding: generateEmbedding(...),  // Intelligence
  metadata: { qualityScore: 0.85 },  // Analytics
});
```

---

## Testing Patterns

### Unit Tests (Bun)
```typescript
import { test, expect } from 'bun:test';

test('canon enforcement blocks invalid models', async () => {
  const client = new RAGAnthropicClient({
    canon: { allowedModels: ['claude-sonnet-4-5'] },
    // ...
  });
  
  expect(async () => {
    await client.complete({
      messages: [{ role: 'user', content: 'test' }],
      model: 'gpt-4', // Not allowed
    });
  }).toThrow(CanonViolationError);
});

test('RAG improves quality over time', async () => {
  const ledger = new MemoryLedger(':memory:');
  
  // First query - no history
  await ledger.append({
    eventType: 'completion',
    payload: { query: 'test', response: 'response1', success: true },
    metadata: { qualityScore: 0.7 },
  });
  
  // Second query - has history
  const similar = await ledger.searchSimilar('test', { limit: 5 });
  expect(similar.length).toBe(1);
});
```

### Integration Tests
```typescript
test('end-to-end RAG flow', async () => {
  const ledger = new MemoryLedger(':memory:');
  const client = new RAGAnthropicClient({
    apiKey: Bun.env.ANTHROPIC_API_KEY,
    canon: defaultCanon,
    memoryLedger: ledger,
    rag: { enabled: true, maxHistoryItems: 5 },
  });
  
  // Execute with RAG
  const result = await client.complete({
    messages: [{ role: 'user', content: 'What is Constitutional AI?' }],
  });
  
  expect(result.content[0].text).toBeDefined();
  expect(result.ragContext).toBeDefined();
  
  // Verify ledger integrity
  const integrity = ledger.verifyIntegrity();
  expect(integrity.valid).toBe(true);
});
```

---

## Performance Optimization

### Database Queries
```typescript
// ✅ Use indexes
db.run(`CREATE INDEX IF NOT EXISTS idx_event_type ON ledger(event_type)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_timestamp ON ledger(timestamp)`);

// ✅ Limit results
const entries = db.query(`
  SELECT * FROM ledger 
  WHERE event_type = ?
  ORDER BY created_at DESC 
  LIMIT 100
`).all(eventType);

// ❌ Avoid full table scans
const all = db.query(`SELECT * FROM ledger`).all(); // Bad
```

### Embedding Caching
```typescript
class MemoryLedger {
  private embeddingCache = new Map<string, number[]>();
  
  async generateEmbedding(text: string): Promise<number[]> {
    // ✅ Check cache first
    if (this.embeddingCache.has(text)) {
      return this.embeddingCache.get(text)!;
    }
    
    const embedding = await computeEmbedding(text);
    this.embeddingCache.set(text, embedding);
    return embedding;
  }
}
```

---

## Error Handling

### Canon Violations
```typescript
// ✅ Specific error types
export class CanonViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CanonViolationError';
  }
}

// ✅ Log violations to ledger
try {
  enforceCanon(params);
} catch (err) {
  if (err instanceof CanonViolationError) {
    await ledger.append({
      eventType: 'canon_violation',
      payload: {
        violationType: 'model_not_allowed',
        attempted: params.model,
        allowed: canon.allowedModels,
      },
      timestamp: new Date().toISOString(),
    });
  }
  throw err; // Re-throw - violation blocks execution
}
```

### Graceful Degradation
```typescript
// ✅ RAG failures don't block execution
async function executeWithMemory(query: string) {
  let ragContext = [];
  
  try {
    ragContext = await memoryLedger.searchSimilar(query);
  } catch (err) {
    console.error('RAG search failed, continuing without history:', err);
    // Continue without RAG - degraded but functional
  }
  
  // Execute regardless
  return await anthropic.complete({ messages, ragContext });
}
```

---

## Documentation Standards

### Function Comments
```typescript
/**
 * Searches ledger for semantically similar past interactions
 * 
 * @param query - User query to find similar entries for
 * @param options - Search configuration
 * @param options.limit - Max results to return (1-20)
 * @param options.minSimilarity - Similarity threshold (0-1)
 * @returns Array of matching ledger entries with similarity scores
 * 
 * @example
 * ```typescript
 * const similar = await ledger.searchSimilar('Constitutional AI', {
 *   limit: 5,
 *   minSimilarity: 0.7,
 * });
 * ```
 */
async function searchSimilar(
  query: string,
  options: SearchOptions
): Promise<MemoryLedgerEntry[]> {
  // Implementation
}
```

### README Structure
```markdown
# Package Name

## Purpose
One-line description of what this package does.

## Installation
```bash
bun add @bickford/package-name
```

## Quick Start
```typescript
import { Thing } from '@bickford/package-name';
const thing = new Thing();
```

## API Reference
### `className`
Description...

## Architecture
How it fits into Bickford...

## Testing
```bash
bun test
```
```

---

## Common Patterns

### Anthropic API Calls
```typescript
// ✅ Standard pattern
async function callAnthropic(params: CompletionParams) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: params.model || 'claude-sonnet-4-5-20250929',
      messages: params.messages,
      max_tokens: params.maxTokens || 1024,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Anthropic API error: ${await response.text()}`);
  }
  
  return await response.json();
}
```

### Hash Chain Verification
```typescript
// ✅ Always verify before trusting
function verifyLedgerIntegrity(): { valid: boolean; violations: string[] } {
  const entries = db.query(`
    SELECT * FROM ledger ORDER BY created_at ASC
  `).all();
  
  const violations: string[] = [];
  
  for (let i = 1; i < entries.length; i++) {
    const prev = entries[i - 1];
    const curr = entries[i];
    
    if (curr.previous_hash !== prev.current_hash) {
      violations.push(`Hash chain broken at entry ${i}: ${curr.id}`);
    }
    
    // Verify current hash
    const computed = computeHash(prev.current_hash, curr);
    if (computed !== curr.current_hash) {
      violations.push(`Invalid hash at entry ${i}: ${curr.id}`);
    }
  }
  
  return {
    valid: violations.length === 0,
    violations,
  };
}
```

---

## Strategic Context

### Why This Matters
When writing code, remember:
1. **Enterprise customers need proof,** not promises
2. **Regulators require cryptographic audit trails**
3. **Anthropic acquisition depends on indispensability**
4. **Every line of code should increase switching cost**

### Code Quality = Acquisition Value
```typescript
// ❌ Low switching cost
function logEvent(data) {
  console.log(data); // Easy to replace
}

// ✅ High switching cost
async function appendToLedger(entry: LedgerEntry) {
  // Hash chain enforcement
  const lastHash = await getLastHash();
  const currentHash = computeHash(lastHash, entry);
  
  // Dual-purpose storage
  await db.run(`INSERT INTO ledger ...`, [
    entry.id,
    entry.previousHash,
    currentHash,
    JSON.stringify(entry.embedding), // Intelligence layer
    entry.timestamp,
  ]);
  
  // Real-time integrity check
  if (!verifyHashChain(entry)) {
    throw new IntegrityViolationError();
  }
  
  return { ...entry, currentHash };
}
// ^ Replacing this requires rebuilding entire architecture
```

---

## Quick Reference

### Must-Use Libraries
- `bun:sqlite` - Database (NOT sqlite3)
- `crypto` - Hashing (built-in)
- No `fs/promises` - Use `Bun.file()`
- No `node-fetch` - Use native `fetch`

### Must-Avoid Patterns
- ❌ `any` types
- ❌ Silent error swallowing
- ❌ Node.js-specific imports
- ❌ Self-validating systems
- ❌ Mutable global state
- ❌ Optional enforcement

### Must-Include
- ✅ TypeScript strict mode
- ✅ Error handling with specific types
- ✅ Ledger append on all mutations
- ✅ Hash verification
- ✅ Tests with `bun:test`
- ✅ Comments for complex logic

---

## When in Doubt

**Ask yourself:**
1. Does this increase switching cost? (good)
2. Is failure architecturally impossible? (good)
3. Can this be externally verified? (good)
4. Does this serve dual purpose (compliance + intelligence)? (good)
5. Is this Bun-native? (required)

**If any answer is "no", reconsider the approach.**

---

## Final Principle

> "Build systems where failure is structurally impossible, not just discouraged."

Every function, every class, every component should embody this principle.

**Make Bickford indispensable by making excellence unavoidable.**
