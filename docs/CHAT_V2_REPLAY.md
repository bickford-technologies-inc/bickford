# Chat v2: Deterministic Thread Replay

## Overview

This implementation adds deterministic thread replay functionality to the Bickford chat system. The key principle is that replay is **side-effect free** and **read-only** - it surfaces existing data without triggering any new executions.

## Changes

### 1. Prisma Schema Updates (`prisma/schema.prisma`)

#### New Models

- **ChatThread**: Groups related chat messages together
  - `id`: Unique identifier
  - `createdAt`: Timestamp of thread creation
  - `lastReplayedAt`: Optional timestamp of last replay (updated on each replay)
  - `messages`: Relation to ChatMessage[]

- **CanonEntry**: Represents entries in the canonical knowledge base
  - `id`: Unique identifier
  - `createdAt`: Timestamp of creation
  - `kind`: Type/category of canon entry
  - `title`: Entry title
  - `content`: Entry content
  - `provenance`: Optional JSON metadata about origin
  - `messages`: Relation to ChatMessage[] (messages that produced this entry)

#### Updated Models

- **ChatMessage**: Extended with thread and canon linkage
  - `threadId`: Optional foreign key to ChatThread
  - `thread`: Relation to ChatThread
  - `canonEntryId`: Optional foreign key to CanonEntry
  - `canonEntry`: Relation to CanonEntry (surfaces which canon entry this message produced)

### 2. API Endpoints

#### New Endpoint: `/api/chat/replay` (GET)

Replays a chat thread in a side-effect free manner.

**Query Parameters:**
- `threadId` (required): The ID of the thread to replay

**Response:**
```json
{
  "thread": {
    "id": "...",
    "createdAt": "...",
    "lastReplayedAt": "...",
    "messages": [
      {
        "id": "...",
        "author": "USER" | "BICKFORD",
        "text": "...",
        "resolution": "CAPTURED" | "DENIED" | "EXECUTING" | "REALIZED",
        "intent": {
          "id": "...",
          "intentType": "OBSERVE" | "QUERY" | "CHANGE" | "AUTOMATE",
          "goal": "...",
          "admissibility": "PENDING" | "ALLOWED" | "DENIED",
          "denialReason": "..."
        } | null,
        "canonEntry": {
          "id": "...",
          "kind": "...",
          "title": "..."
        } | null
      }
    ]
  }
}
```

**Behavior:**
- Fetches thread with all messages, intents, and canon linkage
- Updates `lastReplayedAt` timestamp
- Returns complete thread history with canon attribution
- **Does NOT trigger any execution or side effects**

### 3. Runtime Changes

#### New Module: `packages/core/src/runtime/chatExecutor.ts`

Enforces execution mode invariants for chat operations.

**Types:**
- `ExecutionMode`: `"normal"` | `"replay"`
- `ChatExecutorConfig`: Configuration with mode

**Functions:**
- `executeChatOperation(config, operation)`: Executes operation only if not in replay mode
  - Throws `INVARIANT VIOLATION` error if mode is "replay"
- `assertNotReplayMode(mode)`: Guard that throws if in replay mode
  - Use before any write operations

**Example Usage:**
```typescript
import { executeChatOperation, assertNotReplayMode } from '@bickford/core/runtime/chatExecutor';

// Before execution
assertNotReplayMode(mode);

// Or wrap execution
await executeChatOperation({ mode }, async () => {
  // Your execution logic
});
```

### 4. UI Components

#### `apps/web/src/components/ChatThreadList.tsx`

Displays list of chat threads with replay functionality.

**Features:**
- Shows thread ID and creation timestamp
- Shows last replayed timestamp if available
- Replay button that calls `/api/chat/replay` endpoint
- Updates UI after successful replay

#### `apps/web/src/components/ChatMessageView.tsx`

Displays individual chat messages with metadata.

**Features:**
- Shows author, timestamp, and message text
- Resolution badge (CAPTURED, DENIED, EXECUTING, REALIZED)
- Intent badge (if message produced an intent)
- Canon badge 📚 (if message produced a canon entry)
- Non-intrusive inline display

### 5. Supporting Files

- `apps/web/src/lib/prisma.ts`: Prisma client initialization for web app
- `prisma/migrations/20260112_add_chat_v2_replay/migration.sql`: Database migration

## Invariants Maintained

1. **Replay is Read-Only**: The replay endpoint only reads and surfaces data; it never triggers execution
2. **No New Write Paths**: Only new read paths were added; no execution logic was modified
3. **Canon Linkage is Optional**: Messages can exist without canon entries
4. **Thread Grouping is Optional**: Messages can exist without threads (backward compatible)
5. **Execution Guard**: Runtime explicitly prohibits execution in replay mode

## Testing

The chatExecutor runtime has been validated with unit tests:
- ✅ Normal mode allows execution
- ✅ Replay mode throws INVARIANT VIOLATION error
- ✅ assertNotReplayMode guards work correctly

## Usage

### Creating a Thread (Future Implementation)

```typescript
const thread = await prisma.chatThread.create({
  data: { id: generateId() }
});
```

### Associating Messages with Thread

```typescript
const message = await prisma.chatMessage.create({
  data: {
    author: "USER",
    text: "...",
    resolution: "CAPTURED",
    threadId: thread.id,
  }
});
```

### Linking Canon Entries

```typescript
// When a message produces a canon entry
await prisma.chatMessage.update({
  where: { id: messageId },
  data: { canonEntryId: canonEntry.id }
});
```

### Replaying a Thread

```typescript
const response = await fetch(`/api/chat/replay?threadId=${threadId}`);
const data = await response.json();
// data.thread contains complete history with canon linkage
```

## Migration

To apply the schema changes:

```bash
# Generate Prisma client
npm run prisma:generate

# Apply migration (when database is configured)
npx prisma migrate deploy
```

Or manually apply the migration SQL:
```bash
psql $DATABASE_URL < prisma/migrations/20260112_add_chat_v2_replay/migration.sql
```

## Future Enhancements

- Automatic thread creation on first message
- Thread listing endpoint
- Thread search/filtering
- Canon entry creation/management API
- Thread export functionality
