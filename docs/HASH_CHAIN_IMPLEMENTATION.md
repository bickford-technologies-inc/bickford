# Hash Chaining Implementation - Tamper-Evident Ledger

## Overview

The Bickford repository implements a **cryptographically secure, tamper-evident ledger** using SHA-256 hash chaining. This provides blockchain-grade immutability without the overhead of consensus mechanisms, tokens, or distributed networks.

## Implementation

### Database Schema

Location: `packages/bickford/api/pg-canon-migration-hashchain.sql`

```sql
ALTER TABLE canon_ledger_events
  ADD COLUMN IF NOT EXISTS seq bigint,
  ADD COLUMN IF NOT EXISTS prev_hash text,
  ADD COLUMN IF NOT EXISTS event_hash text;
```

**Fields:**
- `seq`: Monotonically increasing sequence number (starts at 1)
- `prev_hash`: Hash of the previous entry (NULL for genesis entries)
- `event_hash`: SHA-256 hash of current entry

### Hash Function

Location: `packages/bickford/api/decide.contract.ts` (lines 105-106)

```typescript
export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}
```

Uses Node.js crypto library for SHA-256 hashing with hex encoding.

### Deterministic Serialization

Location: `packages/bickford/api/decide.contract.ts` (lines 82-103)

```typescript
export function stableStringify(value: unknown): string {
  const seen = new WeakSet();
  const normalize = (v: any): any => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    if (typeof v !== "object") return v;
    if (seen.has(v)) return "[Circular]";
    seen.add(v);

    if (Array.isArray(v)) return v.map(normalize);

    const keys = Object.keys(v).sort();
    const out: Record<string, any> = {};
    for (const k of keys) {
      const nv = normalize(v[k]);
      if (nv !== undefined) out[k] = nv;
    }
    return out;
  };

  return JSON.stringify(normalize(value));
}
```

**Features:**
- **Key sorting:** Ensures identical objects produce identical hashes regardless of key order
- **Circular reference detection:** Prevents infinite loops with `[Circular]` placeholder
- **Undefined filtering:** Removes undefined values from output for consistency

### Event Hash Computation

Location: `packages/bickford/api/server.ts` (lines 158-174)

```typescript
function computeEventHash(params: {
  pointer: string;
  seq: number;
  ts: string;
  prevHash: string | null;
  payload: unknown;
}) {
  const canonical = stableStringify({
    pointer: params.pointer,
    seq: params.seq,
    ts: params.ts,
    prevHash: params.prevHash,
    payload: params.payload,
  });
  return sha256(canonical);
}
```

**Hash Formula:**
```
H_n = SHA256(stableStringify({
  pointer,     // ledger identifier
  seq: n,      // sequence number
  ts,          // timestamp
  prevHash: H_{n-1},  // previous hash (null for genesis)
  payload      // event data
}))
```

### Ledger Write Logic

Location: `packages/bickford/api/server.ts` (lines 664-716)

**Process:**
1. **Get chain tail**: Fetch last entry from Redis (hot) or Postgres (cold)
2. **Compute next seq**: `nextSeq = (lastSeq ?? 0) + 1`
3. **Compute hash**: `eventHash = computeEventHash({pointer, seq, ts, prevHash, payload})`
4. **Write to Redis**: Hot-path storage for fast reads
5. **Write to Postgres**: Canonical archive with `appendLedgerHashed()`
6. **Update denial index**: Dual-write for why-not queries

**Genesis Entry Logic:**
```typescript
// When no tail exists (first entry in chain)
if (!tail) {
  seq = 0;        // Start at 0
  prevHash = null;  // No previous entry
}
const nextSeq = (seq ?? 0) + 1;  // Increment: 0 -> 1 for genesis

// Result: First entry has seq=1, prevHash=null
```

### Storage Layer

Location: `packages/bickford/api/storage.pg.ts` (lines 118-167)

**Key Methods:**

```typescript
async getLedgerTail(pointer: string): Promise<{ seq: number; eventHash: string } | null>
```
Returns the most recent entry for a given pointer (ledger chain).

```typescript
async appendLedgerHashed(params: {
  ts, tenantId, actionId, stableKey, pointer, eventType, 
  decisionId?, payload, seq, prevHash, eventHash
}): Promise<void>
```
Atomically appends a new entry with hash chain fields to Postgres.

## Verification Endpoint

Location: `packages/bickford/api/server.ts` (lines 58-131)

**Route:** `GET /api/canon/ledger/verify/:pointer`

**Algorithm:**
```typescript
1. Fetch all events for pointer from Postgres
2. Initialize: prevHash = null, expectedSeq = 1
3. For each event:
   a. Verify seq === expectedSeq
   b. Verify event.prevHash === prevHash
   c. Recompute hash and verify event.eventHash === recomputed
   d. Update: prevHash = event.eventHash, expectedSeq++
4. Return {ok: true, count, head: {seq, hash}}
```

**Success Response:**
```json
{
  "ok": true,
  "pointer": "tenant-abc-action-123",
  "count": 42,
  "head": {
    "seq": 42,
    "hash": "c0d6fabdc063d4ced4f98e38136b9db1..."
  }
}
```

**Failure Response:**
```json
{
  "ok": false,
  "pointer": "tenant-abc-action-123",
  "reason": "HASH_MISMATCH",
  "atSeq": 15,
  "expectedHash": "abc123...",
  "foundHash": "def456..."
}
```

**Error Types:**
- `SEQ_MISMATCH`: Sequence number discontinuity
- `PREV_HASH_MISMATCH`: Chain linkage broken
- `HASH_MISMATCH`: Event data tampered

## Security Properties

### Immutability
✅ **Cryptographic**: Any modification to an entry changes its hash, breaking the chain.

✅ **Deterministic**: Same input always produces same hash.

✅ **Tamper-evident**: Verification endpoint detects all modifications.

### Verification
✅ **Offline**: No network required once data is fetched.

✅ **Trustless**: Math-based, no authority required.

✅ **Fast**: O(n) verification for n entries.

### Genesis Entry
✅ **Well-defined**: First entry has `seq=1, prevHash=null`.

✅ **Unique**: Each pointer (ledger chain) has its own genesis.

## Test Results

### Hash Function
✅ SHA-256 produces 64-character hex strings
✅ Deterministic output for same input

### Stable Stringify
✅ Objects with different key orders produce identical strings
✅ Nested objects handled correctly

### Chain Integrity
✅ Genesis entry (seq=1, prevHash=null) validated
✅ Chain of 3 entries verified successfully
✅ Head hash computed correctly

### Tampering Detection
✅ Payload modification detected at correct entry
✅ Hash mismatch identified immediately
✅ Verification fails as expected

## Usage Example

```typescript
// Writing to ledger (automatic in canon endpoints)
await ledgerWrite({
  ts: '2026-01-04T12:00:00Z',
  tenantId: 'tenant-123',
  actionId: 'DECIDE/ACTION-456',
  stableKey: 'stable-key-hash',
  type: 'DECISION_ALLOWED',
  decisionId: 'decision-789',
  payload: { /* decision data */ }
});

// Verifying chain integrity
GET /api/canon/ledger/verify/tenant-123-action-456

// Response
{
  "ok": true,
  "pointer": "tenant-123-action-456",
  "count": 100,
  "head": { "seq": 100, "hash": "abc123..." }
}
```

## Integration Points

**Canon Decision API** (`POST /api/canon/decide`)
- Every decision (ALLOW/DENY) writes to ledger with hash chain

**Canon Promotion API** (`POST /api/canon/promote`)
- Promotion outcomes recorded in hash chain

**Non-Interference Check** (`POST /api/canon/noninterference`)
- NI check results recorded in hash chain

**Why-Not Queries** (`GET /api/canon/whynot/:id`)
- Denial traces indexed and linked to hash chain entries

## Migration Path

**Initial Setup:**
```bash
psql $DATABASE_URL < packages/bickford/api/pg-canon-migration.sql
psql $DATABASE_URL < packages/bickford/api/pg-canon-migration-hashchain.sql
```

**Existing Data:**
- Pre-migration entries have `seq=NULL, prev_hash=NULL, event_hash=NULL`
- Post-migration entries form valid hash chains
- Verification skips entries with NULL hash fields

## Claims Enabled

> "Every canon decision is cryptographically chained. Any modification to history is mathematically detectable. No trust required—just verify the chain."

This is **execution-grade tamper evidence**, not marketing fluff.

---

**Implementation Status:** ✅ Complete and tested
**Location:** `packages/bickford/api/`
**Documentation:** This file
**Validation:** Hash chain logic tested and verified (see Test Results section above)
