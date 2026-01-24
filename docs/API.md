# Bickford API Reference

## Base URL

- **Development:** `http://localhost:3000`
- **Production:** `https://bickford.vercel.app`

## Authentication

Most endpoints require an API token:

```
Authorization: Bearer {BICKFORD_API_TOKEN}
```

Set `BICKFORD_API_TOKEN` in your `.env` file.

## Endpoints

### List API Keys

List API keys for the organization.

**Endpoint:** `GET /v1/organizations/api_keys`

**How to use it:**
1. Ensure you have an organization admin API key available as `ANTHROPIC_ADMIN_API_KEY`.
2. Call the endpoint with `X-Api-Key` and optional query parameters to paginate or filter results.
3. Use `after_id`/`before_id` with `first_id`/`last_id` from the response to page through results.

**Query Parameters:**
- `after_id` (optional string): ID of the object to use as a cursor for pagination. When provided, returns the page of results immediately after this object.
- `before_id` (optional string): ID of the object to use as a cursor for pagination. When provided, returns the page of results immediately before this object.
- `created_by_user_id` (optional string): Filter by the ID of the User who created the object.
- `limit` (optional number): Number of items to return per page. Defaults to `20`. Ranges from `1` to `1000`.
- `status` (optional `"active" | "inactive" | "archived"`): Filter by API key status.
- `workspace_id` (optional string): Filter by Workspace ID.

**Response:**
```json
{
  "data": [
    {
      "id": "string",
      "created_at": "2024-02-02T19:20:30.000Z",
      "created_by": {
        "id": "string",
        "type": "string"
      },
      "name": "string",
      "partial_key_hint": "string",
      "status": "active",
      "type": "api_key",
      "workspace_id": "string"
    }
  ],
  "first_id": "string",
  "has_more": false,
  "last_id": "string"
}
```

**Example:**
```http
curl https://api.anthropic.com/v1/organizations/api_keys \
  -H "X-Api-Key: $ANTHROPIC_ADMIN_API_KEY"
```

**Example with filtering and pagination:**
```http
curl "https://api.anthropic.com/v1/organizations/api_keys?status=active&limit=50&after_id=api_key_123" \
  -H "X-Api-Key: $ANTHROPIC_ADMIN_API_KEY"
```

### Execute Intent

Execute a natural language intent through the Bickford runtime.

Every successful execution also writes a **compounding knowledge** entry to the daily `knowledge` archive so decisions accumulate into a persistent memory stream.
Each execution also records **dynamic performance** in a daily `performance` archive, capturing execution duration and traceability to the ledger entry.
Each execution also records **dynamic configuration** in a daily `configuration` archive, capturing the resolved configuration fingerprint and any overrides applied.

**Endpoint:** `POST /api/execute`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "origin": "agent-id",
  "intent": "Add retry logic to API client",
  "source": "realtime",
  "sessionId": "session_123",
  "transcript": "Add retry logic to the API client.",
  "metadata": {
    "model": "gpt-realtime",
    "channel": "webrtc"
  },
  "configOverrides": {
    "routing": "low-latency",
    "region": "iad"
  }
}
```

**Response (Allow):**
```json
{
  "decision": {
    "outcome": "ALLOW",
    "allowed": true,
    "canonId": "CANON-123",
    "rationale": "Intent meets all canonical requirements",
    "timestamp": "2026-01-06T04:00:00.000Z"
  },
  "ledgerEntry": {
    "id": "uuid",
    "intent": { ... },
    "decision": { ... },
    "hash": "sha256-hash",
    "createdAt": "2026-01-06T04:00:00.000Z"
  },
  "knowledge": {
    "entryId": "uuid"
  },
  "performance": {
    "entryId": "uuid",
    "durationMs": 125,
    "peakDurationMs": 210
  },
  "configuration": {
    "entryId": "uuid",
    "fingerprint": "abc123def4567890"
  }
}
```

**Response (Deny):**
```json
{
  "decision": {
    "outcome": "DENY",
    "allowed": false,
    "canonId": "NON-INTERFERENCE",
    "rationale": "Intent violates non-interference for agent-2",
    "violatedAgent": "agent-2",
    "deltaTTV": 150,
    "timestamp": "2026-01-06T04:00:00.000Z"
  },
  "ledgerEntry": { ... }
}
```

---

### Query Ledger

Retrieve all ledger entries.

**Endpoint:** `GET /api/ledger`

**Response:**
```json
[
  {
    "id": "uuid",
    "intent": {
      "origin": "agent-1",
      "intent": "..."
    },
    "decision": {
      "outcome": "ALLOW",
      "allowed": true,
      ...
    },
    "hash": "sha256-hash",
    "createdAt": "2026-01-06T04:00:00.000Z"
  }
]
```

---

### Canon Status

Get current canon enforcement status.

**Endpoint:** `GET /api/canon`

**Response:**
```json
{
  "active": true,
  "version": "1.0.0",
  "timestamp": "2026-01-06T04:00:00.000Z",
  "canonRefs": ["authority", "optr", "ledger"]
}
```

---

### Health Check

Check service health.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-06T04:00:00.000Z",
  "uptime": 123.45,
  "version": "1.0.0"
}
```

---

### Realtime Intent Capture

Capture realtime transcripts and (optionally) extracted intent for persistence. This endpoint appends to the realtime archive, and if an `intent` is provided it also appends to the intent archive.

**Endpoint:** `POST /api/realtime`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}` (if your deployment enforces auth)

**Request Body:**
```json
{
  "sessionId": "session_123",
  "transcript": "User said: add a daily digest reminder.",
  "intent": "Add a daily digest reminder",
  "execute": true,
  "source": "realtime",
  "metadata": {
    "model": "gpt-realtime",
    "channel": "webrtc"
  },
  "configOverrides": {
    "routing": "low-latency",
    "region": "iad"
  }
}
```

**Response:**
```json
{
  "status": "ok"
}
```

If `execute` is true and an `intent` is provided, the response includes the execution result:

```json
{
  "status": "ok",
  "execution": {
    "decision": {
      "outcome": "ALLOW",
      "allowed": true,
      "canonId": "CANON-EXECUTE",
      "rationale": "Intent accepted for execution.",
      "timestamp": "2026-01-06T04:00:00.000Z"
    },
    "ledgerEntry": {
      "id": "uuid",
      "intent": {
        "origin": "agent-id",
        "intent": "Add a daily digest reminder",
        "source": "realtime",
        "sessionId": "session_123",
        "transcript": "User said: add a daily digest reminder."
      },
      "context": {
        "metadata": {
          "model": "gpt-realtime",
          "channel": "webrtc"
        }
      },
      "decision": {
        "outcome": "ALLOW",
        "allowed": true,
        "canonId": "CANON-EXECUTE",
        "rationale": "Intent accepted for execution.",
        "timestamp": "2026-01-06T04:00:00.000Z"
      },
      "hash": "sha256-hash",
      "createdAt": "2026-01-06T04:00:00.000Z"
    },
    "knowledge": {
      "entryId": "uuid"
    },
    "performance": {
      "entryId": "uuid",
      "durationMs": 125,
      "peakDurationMs": 210
    },
    "configuration": {
      "entryId": "uuid",
      "fingerprint": "abc123def4567890"
    }
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `500` - Internal Server Error

---

## Examples

### Node.js
```javascript
const response = await fetch('http://localhost:3000/api/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + process.env.BICKFORD_API_TOKEN,
  },
  body: JSON.stringify({
    origin: 'my-agent',
    intent: 'Add health check endpoint',
  }),
});

const data = await response.json();
console.log(data);
```

### curl
```bash
curl -X POST http://localhost:3000/api/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BICKFORD_API_TOKEN" \
  -d '{
    "origin": "my-agent",
    "intent": "Add health check endpoint"
  }'
```

### Python
```python
import requests
import os

response = requests.post(
    'http://localhost:3000/api/execute',
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {os.environ["BICKFORD_API_TOKEN"]}',
    },
    json={
        'origin': 'my-agent',
        'intent': 'Add health check endpoint',
    }
)

print(response.json())
```
