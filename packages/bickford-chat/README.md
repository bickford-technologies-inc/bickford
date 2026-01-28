# @bickford/chat

## Purpose
Canonical chat session types and helpers for Bickford UI, API, and ledger capture.

## Installation
```bash
pnpm add @bickford/chat
```

## Quick Start
```typescript
import { createChatThread, createChatMessage, appendChatMessage } from "@bickford/chat";

const thread = createChatThread({ title: "Onboarding" });
const message = createChatMessage({ role: "user", content: "Start" });
const updated = appendChatMessage(thread, message);
```

## Testing
```bash
pnpm run --filter @bickford/chat test
```
