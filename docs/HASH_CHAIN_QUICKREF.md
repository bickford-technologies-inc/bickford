# Hash Chain Quick Reference

## Overview

Every decision in the Bickford Canon is cryptographically chained using SHA-256. Any tampering with history is mathematically detectable.

## Verifying Chain Integrity

### API Endpoint

```bash
GET /api/canon/ledger/verify/:pointer
```

### Example Request

```bash
curl http://localhost:3000/api/canon/ledger/verify/tenant-abc-action-123
```

### Success Response

```json
{
  "ok": true,
  "pointer": "tenant-abc-action-123",
  "count": 42,
  "head": {
    "seq": 42,
    "hash": "c0d6fabdc063d4ced4f98e38136b9db1a8e2f3c4..."
  }
}
```

### Failure Response (Tampering Detected)

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

## Error Types

| Error | Meaning |
|-------|---------|
| `SEQ_MISMATCH` | Sequence numbers are not continuous |
| `PREV_HASH_MISMATCH` | Chain linkage is broken |
| `HASH_MISMATCH` | Event data has been modified |

## How It Works

### Genesis Entry
```typescript
{
  seq: 1,
  prevHash: null,  // First entry has no predecessor
  eventHash: "abc123...",
  payload: { /* event data */ }
}
```

### Subsequent Entries
```typescript
{
  seq: 2,
  prevHash: "abc123...",  // Hash of previous entry
  eventHash: "def456...",  // SHA256 of this entry
  payload: { /* event data */ }
}
```

### Hash Formula
```
H_n = SHA256(stableStringify({
  pointer: "ledger-id",
  seq: n,
  ts: "2026-01-04T12:00:00Z",
  prevHash: H_{n-1},
  payload: { /* event data */ }
}))
```

## Integration

Hash chaining is **automatic** for all canon operations:

- ✅ `POST /api/canon/decide` - Every decision (ALLOW/DENY)
- ✅ `POST /api/canon/promote` - Every promotion outcome
- ✅ `POST /api/canon/noninterference` - Every NI check
- ✅ Denial traces - Indexed with hash chain references

## Security Guarantees

| Property | Guarantee |
|----------|-----------|
| **Immutability** | Any modification breaks the chain |
| **Detectability** | 100% detection rate for tampering |
| **Offline Verification** | No network required once data is fetched |
| **Trustless** | Math-based, no authority needed |
| **Performance** | O(n) verification for n entries |

## Common Use Cases

### Audit Trail
Verify that historical decisions haven't been modified:
```bash
curl http://localhost:3000/api/canon/ledger/verify/audit-2026-q1
```

### Compliance
Prove integrity of decision history to regulators:
```bash
curl http://localhost:3000/api/canon/ledger/verify/compliance-log
```

### Why-Not Queries
Link denial traces to tamper-proof ledger:
```bash
curl http://localhost:3000/api/canon/whynot/decision-abc123
# Returns denial with chain references: {pointer, seq, eventHash}
```

## Database Schema

```sql
-- canon_ledger_events table
seq bigint          -- Sequence number (1, 2, 3, ...)
prev_hash text      -- Hash of previous entry (NULL for genesis)
event_hash text     -- SHA256 of this entry
payload jsonb       -- Event data
```

## Migration

Existing entries (pre-upgrade) have `seq=NULL, prev_hash=NULL, event_hash=NULL`.

New entries (post-upgrade) form valid hash chains.

## Troubleshooting

**Q: Verification fails with `HASH_MISMATCH`**
A: Someone modified the database directly. Check database audit logs.

**Q: Verification fails with `SEQ_MISMATCH`**
A: Entries were deleted or inserted out of order. Check database logs.

**Q: Verification fails with `PREV_HASH_MISMATCH`**
A: Chain linkage was broken. This should never happen unless database was tampered with.

**Q: How do I know if a specific entry was tampered with?**
A: The verification endpoint returns `atSeq` indicating which entry failed validation.

## Further Reading

- Full Implementation Docs: `docs/HASH_CHAIN_IMPLEMENTATION.md`
- Database Migration: `packages/bickford/api/pg-canon-migration-hashchain.sql`
- Verification Logic: `packages/bickford/api/server.ts` (lines 58-131)
- Hash Function: `packages/bickford/api/decide.contract.ts` (lines 105-106)
