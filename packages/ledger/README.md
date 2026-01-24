# @bickford/ledger

Durable Prisma/Postgres persistence for intent-decision pairs in the Bickford system.

## Overview

This package provides hash-integrity verified storage for authorization decisions, ensuring:
- ✅ Ledger entries persist across server restarts
- ✅ Hash integrity maintained (same input → same hash)
- ✅ Auditable history persists independently
- ✅ Enterprise-grade durability

## Installation

```bash
npm install @bickford/ledger
```

## Prerequisites

- PostgreSQL database
- `DATABASE_URL` environment variable set

Example:
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/bickford"
```

## Database Setup

### 1. Generate Prisma Client

```bash
npx prisma generate
```

### 2. Create Migration (Development)

```bash
npx prisma migrate dev --name init
```

### 3. Deploy Migration (Production)

```bash
npx prisma migrate deploy
```

## Usage

```typescript
import { appendLedger, getLedger } from "@bickford/ledger";
import { authorize } from "@bickford/authority";
import type { Intent } from "@bickford/types";

// Create an intent
const intent: Intent = {
  action: "deploy_to_production",
  context: { service: "api", version: "1.0.0" },
  timestamp: new Date().toISOString(),
};

// Get authorization decision
const decision = authorize(intent);

// Append to ledger (persisted to Postgres)
const entry = await appendLedger(intent, decision);
console.log("Entry ID:", entry.id);
console.log("Hash:", entry.hash);

// Retrieve all ledger entries
const ledger = await getLedger();
console.log("Total entries:", ledger.length);
```

## Memory-Enabled Ledger (RAG Bridge Example)

For a standalone example that adds embeddings, similarity search, and analytics on
top of a hash-chained ledger, see:

```
packages/ledger/examples/memory-ledger.ts
```

This example uses Bun + SQLite and is intended for local experimentation rather than
production deployment.

## API

### `appendLedger(intent, decision)`

Appends an intent-decision pair to the ledger.

**Parameters:**
- `intent: Intent` - The intent object
- `decision: Decision` - The authorization decision

**Returns:** `Promise<LedgerEntry>` - The created ledger entry with ID, hash, and timestamp

### `getLedger()`

Retrieves all ledger entries, ordered by creation date (most recent first).

**Returns:** `Promise<LedgerEntry[]>` - Array of all ledger entries

## Hash Integrity

Each ledger entry includes a SHA-256 hash of the intent-decision pair:

```typescript
const payload = JSON.stringify({ intent, decision });
const hash = crypto.createHash("sha256").update(payload).digest("hex");
```

This ensures tamper-evident storage and verifiable audit trails.

## Testing

Run the demo to verify ledger functionality:

```bash
DATABASE_URL="postgresql://..." npm run demo:ledger
```

## Architecture

- **Database:** PostgreSQL via Prisma
- **Schema:** `prisma/schema.prisma`
- **Client:** Singleton pattern with dev hot-reload support
- **Storage:** JSON columns for intent/decision flexibility

## Production Deployment

1. Set `DATABASE_URL` environment variable
2. Run `npx prisma migrate deploy`
3. Ensure `NODE_ENV=production` for optimal Prisma Client usage

## Related Packages

- `@bickford/types` - Shared type definitions
- `@bickford/authority` - Authorization decision logic
