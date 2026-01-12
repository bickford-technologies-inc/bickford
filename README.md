# Bickford

![Canon](https://img.shields.io/badge/Bickford-Canon%20Clean-brightgreen)

**Intent → Reality in <5 seconds**

Zero-approval execution runtime with OPTR gating, canon enforcement, and immutable ledger.

## Quick Start

```bash
git clone https://github.com/bickfordd-bit/bickford.git
cd bickford
npm run start
```

Open http://localhost:3000

## What This Is

Bickford is an execution authority layer that:

1. **Accepts natural language intent** (e.g. "Add retry logic to API client")
2. **Computes optimal execution path** (OPTR engine)
3. **Enforces canonical rules** (SHA-256 verification)
4. **Executes changes** (code generation + commit)
5. **Records immutably** (append-only ledger)

No approval gates. No manual steps. No "save draft" buttons.

## Architecture

- **OPTR Engine** - Optimizes Time-to-Value across decision paths
- **Canon Authority** - SHA-256 gated execution (hash mismatch = ABORT)
- **Ledger** - Append-only Postgres log (every execution recorded)
- **Session Completion** - Event capture with <5ms p99 latency
- **Claude Integration** - Optional AI-powered intent parsing

## Deployment

**Production:** https://bickford.vercel.app

**Deploy:** `git push origin main` (auto-deploys via Vercel)

## API

### Execute Intent

```bash
POST /api/execute
Authorization: Bearer {BICKFORD_API_TOKEN}
Content-Type: application/json

{
  "intent": "Add health check endpoint"
}
```

### Query Ledger

```bash
GET /api/ledger?limit=10
```

### Canon Status

```bash
GET /api/canon
```

## Environment Variables

Required:

- `DATABASE_URL` - Postgres connection
- `BICKFORD_API_TOKEN` - API authentication

Optional:

- `GITHUB_TOKEN` - Auto-commit to GitHub
- `ANTHROPIC_API_KEY` - Claude intent parsing
- `DEMO_MODE=true` - Safe demo mode (no real execution)

## Docs

- [Quickstart Guide](docs/QUICKSTART.md)
- [API Reference](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Acquisition Docs](docs/ACQUISITION.md)

## If This Repo Exists, Bickford Is Usable

Test:

1. Clone repo
2. Run `npm run start`
3. Submit intent
4. Get ledger hash back in <5 seconds

If any step fails, the consolidation is incomplete.
