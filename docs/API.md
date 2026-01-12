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

### Execute Intent

Execute a natural language intent through the Bickford runtime.

**Endpoint:** `POST /api/execute`

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "origin": "agent-id",
  "intent": "Add retry logic to API client"
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
