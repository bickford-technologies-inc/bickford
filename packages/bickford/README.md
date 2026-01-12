# Bickford Canon

**TIMESTAMP**: 2025-12-21T14:41:00-05:00  
**STATUS**: LOCKED (canonical authority)

## Overview

The Bickford Canon is a **mathematical decision framework** that minimizes Expected Time-to-Value (E[TTV]) subject to hard invariant constraints. It implements **OPTR (Opportunity Targeting & Response)** with provable guarantees for multi-agent systems.

### Canonical Formula

```
π* = argmin_{π ∈ Π_adm(S(K_t))} E[TTV(π) + λC·C(π) + λR·R(π) − λP·log p(π)]
```

Where:
- **TTV(π)**: Time-to-Value under policy π
- **C(π)**: Expected cost
- **R(π)**: Expected risk  
- **p(π)**: Success probability
- **Π_adm**: Admissible policy set (satisfies invariants)
- **S(K_t)**: Knowledge structure at time t

## Core Invariants (HARD_FAIL)

1. **INV_TS_MANDATORY**: All authority-bearing knowledge must have timestamp + provenance
2. **INV_CANON_ONLY_EXECUTION**: Admissible actions must cite CANON-level refs
3. **INV_PROMOTION_GATE**: Promotion requires 4 tests (resistance, reproducibility, invariant safety, feasibility impact)
4. **INV_NON_INTERFERENCE**: Agent actions cannot increase other agents' E[TTV]
5. **INV_TRUST_DENIAL_TRACE**: Every denial produces auditable WhyNot trace
6. **INV_SESSION_COMPLETION_LEDGER**: Session completions are ledger events

## Three Mechanical Upgrades (Applied)

### 1. Authority Boundary Enforcement
**Function**: `requireCanonRefs(actionId, canonRefsUsed, canonStore)`

Hard-fails if:
- Zero canon refs cited
- Refs don't exist in store
- Refs exist but aren't CANON level

### 2. Stable WhyNot Taxonomy
**Enum**: `DenialReasonCode`

```typescript
enum DenialReasonCode {
  MISSING_CANON_PREREQS,
  INVARIANT_VIOLATION,
  NON_INTERFERENCE_VIOLATION,
  AUTHORITY_BOUNDARY_FAIL,
  RISK_BOUND_EXCEEDED,
  COST_BOUND_EXCEEDED,
  SUCCESS_PROB_TOO_LOW
}
```

### 3. OPTR Selection Bug Fix
**Problem**: `featureFn()` called twice → stochastic/stateful bugs  
**Solution**: Cache `CandidateFeatures` during scoring, reuse for gates

```typescript
// BEFORE (buggy)
candidate.score = scorePath(candidate, featureFn(candidate), weights);
const gates = [gateRisk(featureFn(candidate), ...)]  // BUG: second call

// AFTER (fixed)
candidate.features = featureFn(candidate);  // Cache once
candidate.score = scorePath(candidate, candidate.features, weights);
const gates = [gateRisk(candidate.features, ...)]  // Use cached
```

## Module Structure

```
packages/bickford/src/canon/
├── types.ts           # Core types (CanonLevel, Action, OPTRRun, etc.)
├── invariants.ts      # INVARIANTS + requireCanonRefs()
├── optr.ts            # OPTR decision engine + gates
├── promotion.ts       # 4-test promotion gate
├── nonInterference.ts # Multi-agent TTV checking
└── index.ts           # Public API barrel
```

## Usage Example

```typescript
import { 
  optrResolve, 
  requireCanonRefs, 
  promotionGate,
  DEFAULT_WEIGHTS 
} from "@bickford/canon";

// 1. Check authority boundary
const authCheck = requireCanonRefs(
  action.id, 
  ["CANON_001", "CANON_042"], 
  canonStore
);
if (!authCheck.ok) {
  throw new Error(authCheck.message);
}

// 2. Run OPTR to select best path
const run = optrResolve({
  ts: new Date().toISOString(),
  tenantId: "tenant-123",
  goal: "Minimize TTV for feature X",
  candidates: [pathA, pathB, pathC],
  canonRefsUsed: ["CANON_001", "CANON_042"],
  canonIdsPresent: Array.from(canonStore.keys()),
  canonStore,
  weights: DEFAULT_WEIGHTS,
  bounds: { maxRisk: 0.3, maxCost: 1000 },
  featureFn: (path) => extractFeatures(path)
});

// 3. Handle denials
if (run.denyTraces) {
  for (const deny of run.denyTraces) {
    console.log(`Denied: ${deny.actionId}`, deny.reasonCodes);
  }
}

// 4. Execute selected action
if (run.selectedNextActionId) {
  await executeAction(run.selectedNextActionId);
}

// 5. Promotion gate (for knowledge updates)
const tests = await runPromotionTests({
  itemId: "NEW_EVIDENCE_001",
  evidenceRefs: ["EXP_001", "OBS_002"],
  checkResistance: async () => true,
  checkReproducibility: async () => true,
  checkInvariantSafety: async () => true,
  checkFeasibilityImpact: async () => true
});

const decision = promotionGate({
  ts: new Date().toISOString(),
  itemId: "NEW_EVIDENCE_001",
  from: "EVIDENCE",
  tests
});

if (decision.approved) {
  // Promote to CANON
  canonStore.set("NEW_EVIDENCE_001", { level: "CANON", ...item });
}
```

## Integration with Session Completion

Session completion events MUST be recorded as ledger events per `INV_SESSION_COMPLETION_LEDGER`:

```typescript
import { LedgerEvent } from "@bickford/canon";

const ledgerEvent: LedgerEvent = {
  id: `evt_${Date.now()}`,
  ts: new Date().toISOString(),
  actor: "session-runtime",
  tenantId: "tenant-123",
  kind: "SESSION_COMPLETION",
  payload: {
    sessionId: "sess_abc",
    outcome: "success",
    usageTokens: 1523,
    latencyMs: 450
  },
  provenance: {
    source: "prod",
    ref: "runtime-v1.0.0",
    author: "system"
  }
};
```

## Why This Matters for Acquisition

### Strategic Value
1. **Mathematical Moat**: Provable TTV optimization with formal invariants
2. **Multi-Agent Safety**: Non-interference guarantees prevent coordination failures
3. **Auditability**: Every denial traced with stable taxonomy
4. **Authority Control**: Mechanical enforcement prevents unauthorized action expansion

### Competitive Differentiation
- **vs. AWS Step Functions**: No TTV optimization, no formal guarantees
- **vs. LangChain**: No promotion gate, evidence can corrupt action space
- **vs. AutoGPT**: No non-interference, agents interfere freely

### Valuation Impact
- Transforms session completion from "event routing" → **"AI decision framework with provable guarantees"**
- Increases strategic value beyond $25M baseline (now defensible as platform, not feature)
- Creates IP moat (mathematical framework + 3 mechanical upgrades = patentable)

## Build & Test

```bash
# Install dependencies
npm install

# Type-check
npm run typecheck

# Build
npm run build

# Output: dist/index.js, dist/index.d.ts
```

## License

**PROPRIETARY** - All rights reserved. Not for public distribution.

---

**Canonical Authority**: This module is LOCKED. Changes require promotion gate approval (4 tests: resistance, reproducibility, invariant safety, feasibility impact).

