# Phase 3: Trust UX Implementation

**Status:** ✅ Complete  
**Timestamp:** 2026-01-12T21:35:00Z

## Overview

Phase 3 implements Trust UX mechanically, ensuring **no silent denials** and providing **replayable WhyNot explanations**.

## What's Included

### 1. Schema Changes (`prisma/schema.prisma`)
- **DenialReasonCode enum**: Stable taxonomy of 7 denial reasons
- **DeniedDecision model**: Ledger for all denied decisions
- Indexed by `actionId`, `tenantId`, `createdAt` for efficient queries

### 2. Denial API Types (`packages/bickford/src/canon/types.ts`)
- `DeniedDecisionPayload`: Structured payload for ledger persistence
- `WhyNotTrace`: Already existed, now wired to persistence layer
- `DenialReasonCode`: Already existed, now mirrored in Prisma schema

### 3. Persistence Layer (`packages/bickford/src/canon/denials/`)
- `persistDeniedDecision()`: Ledgers a single denial
- `getDeniedDecisions()`: Retrieves denials for WhyNot queries

### 4. Runtime Denial (`packages/core/src/runtime/deny.ts`)
- `mechanicalDeny()`: Canonical denial function with automatic persistence
- `mechanicalDenyBatch()`: Batch denial for OPTR runs
- **All denials MUST flow through these functions**

### 5. OPTR Integration (`packages/core/src/optr/selectPolicy.ts`)
- `selectPolicyWithDenialTracking()`: Wraps OPTR with automatic denial ledgering
- Collects all denial traces from gate functions
- Persists them via `mechanicalDenyBatch()`

### 6. WhyNot API (`apps/web/src/app/api/why-not/route.ts`)
- `GET /api/why-not?actionId=...&tenantId=...`
- Returns all denials for an action/tenant
- Replayable explanations with full context

### 7. CI Enforcement (`scripts/check-trust-invariants.mjs`)
Validates:
- ✓ Prisma schema has DenialReasonCode enum
- ✓ Prisma schema has DeniedDecision model
- ✓ persistDeniedDecision.ts exists and exports correctly
- ✓ runtime/deny.ts exists with mechanicalDeny/mechanicalDenyBatch
- ✓ mechanicalDeny calls persistDeniedDecision
- ✓ WhyNot API exists and uses getDeniedDecisions
- ✓ Scans for unpersisted denials (with gate function exceptions)

### 8. GitHub Workflow (`.github/workflows/trust-invariants.yml`)
- Runs on every PR and push to main/develop
- Blocks merge if trust invariants fail
- Prevents regression permanently

## Guarantees After Merge

1. **No Silent Denials**
   - Every denial flows through `mechanicalDeny()`
   - CI blocks code that creates WhyNotTrace without persistence
   - Gate functions are allowed (they feed into OPTR which persists)

2. **No Unexplained Rejection**
   - WhyNot API provides replayable explanations
   - Stable DenialReasonCode taxonomy
   - Full context preserved in ledger

3. **Every Denial is Ledgered**
   - Prisma DeniedDecision model
   - Indexed for efficient queries
   - Tenant-isolated

4. **CI Blocks Regression Permanently**
   - check-trust-invariants.mjs validates structure
   - GitHub Actions enforces on every PR
   - Cannot merge if invariants fail

## How to Use

### Creating Denials (for developers)

**DO NOT** create WhyNotTrace objects and return them directly from business logic.

**DO** use gate functions that return `WhyNotTrace | null`:

```typescript
// ✅ Correct: Gate function
export function gateMyCheck(action: Action, nowIso: string): WhyNotTrace | null {
  if (!someCondition) {
    return {
      ts: nowIso,
      actionId: action.id,
      denied: true,
      reasonCodes: [DenialReasonCode.INVARIANT_VIOLATION],
      message: "Reason for denial",
    };
  }
  return null;
}
```

Then in OPTR or runtime code, collect traces and persist:

```typescript
import { mechanicalDenyBatch } from "@bickford/core/runtime";

const traces = [gateCheck1(), gateCheck2()].filter(t => t !== null);
await mechanicalDenyBatch({ traces, tenantId, goal, actions });
```

Or use `selectPolicyWithDenialTracking()` which does this automatically:

```typescript
import { selectPolicyWithDenialTracking } from "@bickford/core/optr";

const result = await selectPolicyWithDenialTracking({
  ts: nowIso,
  tenantId,
  goal,
  candidates,
  // ... other params
});

// result.denialIds contains IDs of persisted denials
// result.optrRun.denyTraces contains the traces
```

### Querying Denials (WhyNot API)

```bash
# Get all denials for an action
curl "http://localhost:3000/api/why-not?actionId=action-123&tenantId=tenant-abc"

# Get all denials for a tenant
curl "http://localhost:3000/api/why-not?tenantId=tenant-abc&limit=50"

# POST version with more complex filters (future)
curl -X POST "http://localhost:3000/api/why-not" \
  -H "Content-Type: application/json" \
  -d '{"actionId": "action-123", "tenantId": "tenant-abc"}'
```

Response:
```json
{
  "success": true,
  "count": 3,
  "denials": [
    {
      "ts": "2026-01-12T21:35:00Z",
      "actionId": "action-123",
      "actionName": "Deploy to Production",
      "tenantId": "tenant-abc",
      "goal": "Deploy safely",
      "reasonCodes": ["MISSING_CANON_PREREQS"],
      "missingCanonIds": ["canon-security-review"],
      "message": "Denied: Missing prerequisite canon items",
      "context": { "attempted": "production-deploy" }
    }
  ]
}
```

## Demo

Run the Phase 3 demonstration:

```bash
npm run demo:trust-ux
```

This shows:
- Gate functions creating denials
- Structured denial payloads
- Stable taxonomy
- Mock persistence flow
- WhyNot API usage
- Trust guarantees

## Testing

```bash
# Run trust invariants check
node scripts/check-trust-invariants.mjs

# Should output:
# ✅ All trust invariants satisfied.
```

## Migration

Apply the database migration:

```bash
# Development
npm run prisma:migrate

# Production (Railway, Vercel, etc.)
npx prisma migrate deploy
```

This creates:
- `DenialReasonCode` enum
- `DeniedDecision` table
- Indexes on `actionId`, `tenantId`, `createdAt`

## Architecture

```
User Action
    ↓
OPTR Gate Functions (gateSecondActionTooEarly, gateRiskBounds, etc.)
    ↓
WhyNotTrace objects (if denied)
    ↓
mechanicalDenyBatch() [runtime/deny.ts]
    ↓
persistDeniedDecision() [canon/denials/persistDeniedDecision.ts]
    ↓
Prisma DeniedDecision.create()
    ↓
PostgreSQL (ledger)
    ↓
WhyNot API [apps/web/src/app/api/why-not/route.ts]
    ↓
User gets replayable explanation
```

## File Locations

```
prisma/
  schema.prisma                                    # DenialReasonCode enum, DeniedDecision model
  migrations/20260112_phase3_trust_ux_denial_ledger/
    migration.sql                                  # Migration SQL

packages/bickford/src/canon/
  types.ts                                         # DeniedDecisionPayload type
  index.ts                                         # Exports denial functionality
  denials/
    persistDeniedDecision.ts                       # Persistence + queries

packages/core/src/
  runtime/
    deny.ts                                        # mechanicalDeny, mechanicalDenyBatch
    index.ts                                       # Exports runtime module
  optr/
    selectPolicy.ts                                # OPTR with denial tracking
    index.ts                                       # Exports selectPolicy

apps/web/src/app/api/
  why-not/
    route.ts                                       # WhyNot API endpoint

scripts/
  check-trust-invariants.mjs                       # CI enforcement script

.github/workflows/
  trust-invariants.yml                             # CI workflow

demo/
  demo-trust-ux.ts                                 # Demonstration script
```

## Next Steps

1. Deploy to staging/production with migration
2. Monitor denial patterns via WhyNot API
3. Add analytics dashboard for denial trends (future)
4. Consider ML-based denial prediction (future)

## Notes

- **Gate functions** (naming: `gateXxx` or `xxxGate`) are exempt from direct persistence requirements
- They return `WhyNotTrace | null` and are collected by OPTR/runtime
- Only add new `DenialReasonCode` values via promotion gate
- Taxonomy is stable - breaking changes require migration

---

**Phase 3 is now mechanically enforced. Trust UX is permanent.**
