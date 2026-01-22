# Bickford Architecture

## Overview

Bickford is an execution authority layer that transforms natural language intent into executed reality in under 5 seconds, with zero approval gates.

## Core Components

### 1. OPTR Engine

**Purpose:** Optimize Time-to-Value across decision paths

**Formula:**
```
π* = argmin_{π ∈ Π_adm(S(K_t))} E[TTV(π) + λC·C(π) + λR·R(π) − λP·log p(π)]
```

Where:
- `TTV(π)` = Time-to-Value under policy π
- `C(π)` = Expected cost
- `R(π)` = Expected risk
- `p(π)` = Success probability
- `Π_adm` = Admissible policy set (satisfies invariants)

**Features:**
- Decision optimization with provable guarantees
- Cached feature extraction (deterministic)
- Non-interference checking

### 2. Canon Authority

**Purpose:** SHA-256 gated execution enforcement

**Enforcement Mechanisms:**
- `requireCanonRefs()` - Mechanical gate (hard fail on mismatch)
- Timestamp-based authority validation
- Promotion gate (4-test filter for structural changes)
- Stable denial reason taxonomy

**Invariants:**
1. Timestamps mandatory for authority
2. Canon-only execution (authority boundary)
3. Promotion requires 4 tests
4. Non-interference (∀i≠j: ΔE[TTV_j | π_i] ≤ 0)
5. Trust-first denial traces

### 3. Ledger

**Purpose:** Append-only Postgres log for immutable audit trail

**Storage:**
- Every intent-decision pair recorded
- SHA-256 hash of payload
- Timestamp of execution
- Queryable history

**Implementation:**
- Prisma ORM for type-safe queries
- PostgreSQL for durable persistence
- Automatic hash generation

### 4. Session Completion Runtime

**Purpose:** Event capture with <5ms p99 latency

**Features:**
- Capture: <5ms p99 latency event ingestion
- Buffering: Configurable flush (100 events or 5s)
- Routing: Multi-destination (database, webhook, log, analytics)
- Metrics: Real-time performance tracking

## System Flow

```
1. User submits intent (text or realtime voice/multimodal)
   ↓
2. Session completion captures event
   ↓
3. Non-interference check (OPTR)
   ↓ (if pass)
4. Canon authority validation
   ↓ (if pass)
5. OPTR path selection
   ↓
6. Execution
   ↓
7. Ledger append (immutable record)
   ↓
8. Response with hash + outcome
```

### Realtime entrypoints

Realtime inputs (voice or multimodal) enter the same execution pipeline as text. The Realtime API is treated as an input/output transport layer that feeds intent into Session Completion Runtime, then proceeds through OPTR, canon enforcement, and the ledger. This preserves Bickford’s authority guarantees while enabling low-latency voice interactions.

## Deployment Models

### Development
- Local PostgreSQL via Docker Compose
- Next.js dev server on port 3000
- Hot reload for rapid iteration

### Production (Vercel)
- Automatic deployment on `git push`
- Serverless functions for API routes
- Managed PostgreSQL database
- Environment variables via Vercel secrets

## Performance

- **Latency:** <5ms p99 for session completion capture
- **Throughput:** 100K events/sec capacity
- **Availability:** 99.9% uptime target

## Security

- API token authentication
- Canon enforcement (SHA-256 gating)
- Immutable ledger (audit trail)
- Non-interference checks (multi-agent safety)

## Package Structure

```
@bickford/core          - Consolidated OPTR, Canon, Ledger
@bickford/session-completion - Event capture runtime
@bickford/claude-integration - AI integration layer
@bickford/ui            - React UI components
@bickford/types         - Shared TypeScript types
```

## Technology Stack

- **Runtime:** Node.js 20+
- **Framework:** Next.js 14+ (React 18+)
- **Database:** PostgreSQL + Prisma ORM
- **Language:** TypeScript 5+
- **Deployment:** Vercel
- **Monitoring:** Built-in metrics + health checks

## Competitive Differentiation

**vs AWS/Kafka:**
- Bickford: Intent-aware (semantic understanding)
- AWS/Kafka: Blind transport (no decision layer)

**vs Traditional CI/CD:**
- Bickford: <5 seconds (zero approval gates)
- CI/CD: Minutes to hours (approval + manual steps)

**vs GitHub Actions:**
- Bickford: Canon-enforced (mechanical gates)
- Actions: YAML-based (manual guardrails)

## References

- [Quickstart Guide](QUICKSTART.md)
- [API Reference](API.md)
- [Technical Docs](technical/README.md)
- [Acquisition Docs](ACQUISITION.md)
