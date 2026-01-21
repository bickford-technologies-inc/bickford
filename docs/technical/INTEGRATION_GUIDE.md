# Session Completion Runtime - Integration Guide

**Implementation**: ✅ Production code available  
**Source**: [hvpe-cloud-portal/src/lib/session-completion](https://github.com/bickfordd-bit/hvpe-cloud-portal/tree/main/src/lib/session-completion)  
**Last Updated**: 2025-12-21T18:30:00-05:00

## Overview

This guide provides step-by-step instructions for integrating the **actual working** Session Completion Runtime into your infrastructure.

**Integration Complexity**: LOW (hours to days, not weeks)  
**Code Changes Required**: Minimal (3-5 lines per integration point)  
**Breaking Changes**: NONE (backward compatible)  
**Proof**: Already integrated into hvpe-cloud-portal chat system

---

## Realtime API entrypoints (voice or multimodal)

### Objective
Route low-latency Realtime API sessions into the same Session Completion Runtime capture path so voice interactions trigger the standard Bickford pipeline (OPTR → canon → ledger).

### Integration pattern

1. **Connect to Realtime** using WebRTC (browser) or WebSocket (server proxy).
2. **Normalize intent** into your session completion capture payload.
3. **Capture the session** using the existing Session Completion Runtime client.
4. **Continue** with OPTR decisioning and canon enforcement as usual.

### Minimal payload example (server proxy)

```ts
import { captureRealtimeSessionCompletion } from "@bickford/session-completion";

await captureRealtimeSessionCompletion({
  sessionId: realtimeSessionId,
  userId: user.id,
  organizationId: user.organizationId,
  startTime,
  endTime,
  inputTokens,
  outputTokens,
  model: "gpt-realtime",
  outcome: "success",
  inputModality: "audio",
  transport: "websocket",
});
```

---

## Integration Point 1: OpenAI API Gateway

### Objective
Capture session completion events for all API calls (chat completions, embeddings, fine-tuning jobs)

### Current Architecture (Before)
```python
# api_gateway/routes/chat.py
@app.post("/v1/chat/completions")
async def handle_chat_completion(request: ChatCompletionRequest):
    # Authenticate request
    user = await authenticate(request.headers["Authorization"])
    
    # Generate completion
    response = await completion_engine.generate(
        model=request.model,
        messages=request.messages,
        user_id=user.id
    )
    
    # Return response
    return ChatCompletionResponse(
        id=response.id,
        model=response.model,
        choices=response.choices,
        usage=response.usage
    )
```

### Modified Architecture (After)
```python
# api_gateway/routes/chat.py
from scr_sdk import SessionCompletionRuntime

scr = SessionCompletionRuntime(api_key=os.getenv("SCR_API_KEY"))

@app.post("/v1/chat/completions")
async def handle_chat_completion(request: ChatCompletionRequest):
    # Authenticate request
    user = await authenticate(request.headers["Authorization"])
    
    # Generate completion
    response = await completion_engine.generate(
        model=request.model,
        messages=request.messages,
        user_id=user.id
    )
    
    # ═══════════════════════════════════════════════════
    # ADDED: Capture session completion event
    # ═══════════════════════════════════════════════════
    await scr.capture({
        "event_type": "session.completed",
        "session_id": response.id,
        "user_id": user.id,
        "organization_id": user.organization_id,
        "usage": {
            "input_tokens": response.usage.prompt_tokens,
            "output_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens,
            "model": response.model
        },
        "outcome": {
            "status": "success"
        }
    })
    # ═══════════════════════════════════════════════════
    
    # Return response (unchanged)
    return ChatCompletionResponse(
        id=response.id,
        model=response.model,
        choices=response.choices,
        usage=response.usage
    )
```

### Deployment Steps

1. **Install SDK**:
```bash
cd api_gateway
pip install session-completion-runtime-sdk==1.2.0
```

2. **Configure Environment Variables**:
```bash
# Add to api_gateway/.env
SCR_API_KEY=scr_prod_abc123def456
SCR_ENDPOINT=https://scr.prod.internal:8443
SCR_TIMEOUT_MS=100
```

3. **Update Code** (as shown above)

4. **Deploy to Staging**:
```bash
kubectl apply -f deployments/api-gateway-staging.yaml
```

5. **Validate**:
```bash
# Make test API call
curl -X POST https://api-staging.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $TEST_API_KEY" \
  -d '{"model": "gpt-4", "messages": [{"role": "user", "content": "test"}]}'

# Check SCR captured event
curl https://scr-staging.internal/events/recent | jq '.[-1]'
```

6. **Deploy to Production** (gradual rollout):
```bash
# 1% traffic
kubectl set image deployment/api-gateway \
  api-gateway=api-gateway:v1.2.3-scr --replicas=1

# Monitor for 1 hour, check error rates

# 10% traffic
kubectl scale deployment/api-gateway --replicas=10

# Monitor for 4 hours

# 100% traffic
kubectl scale deployment/api-gateway --replicas=100
```

### Rollback Plan
```bash
# Immediate rollback (if issues detected)
kubectl rollout undo deployment/api-gateway

# Or: Disable SCR capture without rollback
kubectl set env deployment/api-gateway SCR_ENABLED=false
```

---

## Integration Point 2: ChatGPT Web Application

### Objective
Capture session completion events when users close ChatGPT conversations

### Current Architecture (Before)
```javascript
// chatgpt-web/src/session/SessionManager.ts
class SessionManager {
  private sessionId: string;
  private startTime: number;
  
  constructor() {
    this.sessionId = generateSessionId();
    this.startTime = Date.now();
  }
  
  async endSession() {
    // Save conversation history
    await saveConversation(this.sessionId);
    
    // Clean up UI state
    clearMessageBuffer();
  }
}
```

### Modified Architecture (After)
```javascript
// chatgpt-web/src/session/SessionManager.ts
import { SessionCompletionClient } from '@openai/scr-client';

const scrClient = new SessionCompletionClient({
  apiKey: process.env.SCR_API_KEY
});

class SessionManager {
  private sessionId: string;
  private startTime: number;
  private messageCount: number = 0;
  
  constructor() {
    this.sessionId = generateSessionId();
    this.startTime = Date.now();
  }
  
  async endSession() {
    // Save conversation history
    await saveConversation(this.sessionId);
    
    // ═══════════════════════════════════════════════════
    // ADDED: Capture session completion event
    // ═══════════════════════════════════════════════════
    await scrClient.capture({
      event_type: 'session.completed',
      session_id: this.sessionId,
      session_type: 'chat',
      duration_ms: Date.now() - this.startTime,
      message_count: this.messageCount,
      outcome: {
        status: 'user_terminated'
      }
    });
    // ═══════════════════════════════════════════════════
    
    // Clean up UI state
    clearMessageBuffer();
  }
}
```

### Deployment Steps

1. **Install Client Library**:
```bash
cd chatgpt-web
npm install @openai/scr-client@1.2.0
```

2. **Configure Environment Variables**:
```bash
# Add to chatgpt-web/.env.production
VITE_SCR_API_KEY=scr_web_xyz789
VITE_SCR_ENDPOINT=https://scr.prod.internal:8443
```

3. **Update Code** (as shown above)

4. **Build & Deploy**:
```bash
npm run build
aws s3 sync dist/ s3://chatgpt-web-prod/
aws cloudfront create-invalidation --distribution-id EXXX --paths "/*"
```

5. **Validate**:
- Open ChatGPT in browser
- Have a conversation
- Close the browser tab
- Check SCR logs for event capture

---

## Integration Point 3: Agent Frameworks (LangChain, CrewAI, etc.)

### Objective
Capture session completion events from autonomous agents

### LangChain Integration

```python
# agent_framework/langchain_integration.py
from langchain.callbacks.base import BaseCallbackHandler
from scr_sdk import SessionCompletionRuntime

scr = SessionCompletionRuntime(api_key=os.getenv("SCR_API_KEY"))

class SessionCompletionCallback(BaseCallbackHandler):
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.start_time = time.time()
        self.token_count = 0
    
    def on_llm_end(self, response, **kwargs):
        self.token_count += response.llm_output.get("token_usage", {}).get("total_tokens", 0)
    
    def on_agent_finish(self, finish, **kwargs):
        # Capture session completion
        scr.capture({
            "event_type": "session.completed",
            "session_id": self.session_id,
            "session_type": "autonomous",
            "duration_ms": int((time.time() - self.start_time) * 1000),
            "usage": {
                "total_tokens": self.token_count
            },
            "outcome": {
                "status": "success",
                "final_output": finish.return_values
            }
        })

# Usage:
from langchain.agents import initialize_agent

session_id = f"agent_{uuid.uuid4()}"
agent = initialize_agent(
    tools=my_tools,
    llm=my_llm,
    callbacks=[SessionCompletionCallback(session_id)]
)
```

---

## Configuration Reference

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `SCR_API_KEY` | Authentication key for SCR service | Yes | - |
| `SCR_ENDPOINT` | SCR service endpoint URL | Yes | - |
| `SCR_TIMEOUT_MS` | Request timeout in milliseconds | No | 100 |
| `SCR_ENABLED` | Enable/disable event capture | No | true |
| `SCR_BATCH_SIZE` | Events per batch (for high throughput) | No | 100 |
| `SCR_FLUSH_INTERVAL_MS` | Batch flush interval | No | 1000 |

### Runtime Configuration File

```yaml
# scr-config.yaml
session_completion_runtime:
  capture:
    enabled: true
    batch_size: 100
    flush_interval_ms: 1000
    buffer_max_size: 10000
  
  destinations:
    - name: billing
      endpoint: https://billing.internal/api/v1/events
      transform: billing_v1
      retry_attempts: 3
      timeout_ms: 500
      
    - name: analytics
      endpoint: https://analytics.internal/ingest
      transform: analytics_v2
      retry_attempts: 2
      timeout_ms: 200
      sampling_rate: 1.0  # 100% of events
      
    - name: audit
      endpoint: https://compliance.internal/audit
      transform: audit_v1
      retry_attempts: 5
      timeout_ms: 1000
      retention_days: 2555  # 7 years
  
  monitoring:
    metrics_port: 9090
    health_check_port: 8080
    log_level: info
```

---

## Monitoring & Observability

### Metrics Exposed

**Prometheus Metrics** (available at `:9090/metrics`):
```
# Event capture metrics
scr_events_captured_total
scr_events_captured_per_second
scr_capture_latency_ms{quantile="0.5|0.95|0.99"}

# Routing metrics
scr_events_routed_total{destination="billing|analytics|audit"}
scr_routing_failures_total{destination="..."}
scr_routing_latency_ms{destination="..."}

# System metrics
scr_buffer_size_bytes
scr_buffer_utilization_percent
scr_memory_usage_bytes
scr_cpu_usage_percent
```

### Alerting Rules

```yaml
# prometheus-alerts.yaml
groups:
  - name: scr_alerts
    rules:
      - alert: SCRHighLatency
        expr: scr_capture_latency_ms{quantile="0.99"} > 50
        for: 5m
        annotations:
          summary: "Session completion runtime p99 latency > 50ms"
      
      - alert: SCRRoutingFailures
        expr: rate(scr_routing_failures_total[5m]) > 0.01
        for: 2m
        annotations:
          summary: "Session completion routing failure rate > 1%"
      
      - alert: SCRServiceDown
        expr: up{job="session-completion-runtime"} == 0
        for: 1m
        annotations:
          summary: "Session completion runtime service is down"
```

### Logging

```json
{
  "timestamp": "2025-12-21T10:45:23.123Z",
  "level": "INFO",
  "component": "capture",
  "message": "Event captured successfully",
  "event_id": "evt_abc123",
  "session_id": "sess_xyz789",
  "latency_ms": 3.2
}
```

---

## Testing Strategy

### Unit Tests

```python
# tests/test_capture.py
import pytest
from scr_sdk import SessionCompletionRuntime

@pytest.fixture
def scr():
    return SessionCompletionRuntime(api_key="test_key", endpoint="http://localhost:8080")

def test_capture_success(scr, mocker):
    # Mock HTTP client
    mock_post = mocker.patch('httpx.AsyncClient.post')
    mock_post.return_value.status_code = 200
    
    # Capture event
    await scr.capture({
        "session_id": "test_123",
        "usage": {"total_tokens": 100}
    })
    
    # Verify HTTP call
    mock_post.assert_called_once()
    assert "test_123" in str(mock_post.call_args)

def test_capture_retry_on_failure(scr, mocker):
    # Mock HTTP client with transient failure
    mock_post = mocker.patch('httpx.AsyncClient.post')
    mock_post.side_effect = [httpx.TimeoutException, httpx.Response(200)]
    
    # Should retry and succeed
    await scr.capture({"session_id": "test_456"})
    
    assert mock_post.call_count == 2
```

### Integration Tests

```bash
# integration_tests/test_api_integration.sh
#!/bin/bash

# Start SCR in test mode
docker-compose up -d scr-test

# Make API call that should trigger event capture
curl -X POST http://localhost:8000/v1/chat/completions \
  -H "Authorization: Bearer test_key" \
  -d '{"model": "gpt-4", "messages": [{"role": "user", "content": "test"}]}'

# Wait for event to propagate
sleep 1

# Verify event was captured
EVENT_COUNT=$(curl -s http://localhost:9090/metrics | grep 'scr_events_captured_total' | awk '{print $2}')

if [ "$EVENT_COUNT" -gt 0 ]; then
  echo "✓ Integration test passed"
  exit 0
else
  echo "✗ Integration test failed: no events captured"
  exit 1
fi
```

---

## Performance Tuning

### High-Throughput Scenarios (>100K events/sec)

```yaml
# High-throughput configuration
session_completion_runtime:
  capture:
    batch_size: 1000
    flush_interval_ms: 100
    buffer_max_size: 100000
  
  scaling:
    replicas: 10
    partitioning_key: user_id  # Distribute by user
```

### Low-Latency Scenarios (<1ms capture latency)

```yaml
# Low-latency configuration
session_completion_runtime:
  capture:
    batch_size: 1  # No batching
    flush_interval_ms: 0  # Immediate flush
  
  optimization:
    async_mode: true  # Don't block on routing
    compression: false  # Skip compression overhead
```

---

## Security Considerations

### Authentication
- **API Keys**: Rotate every 90 days
- **mTLS**: Enforce mutual TLS between services
- **Network Policies**: SCR only accessible from API gateway namespace

### Data Protection
- **Encryption in Transit**: TLS 1.3
- **Encryption at Rest**: Not applicable (no persistence)
- **PII Scrubbing**: Optional - redact user messages if enabled

### Access Control
```yaml
# Kubernetes RBAC
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: scr-access
rules:
  - apiGroups: [""]
    resources: ["services"]
    resourceNames: ["session-completion-runtime"]
    verbs: ["get", "post"]
```

---

## Troubleshooting

### Issue: Events Not Captured

**Symptoms**: Metrics show 0 events captured  
**Diagnosis**:
```bash
# Check SCR service health
curl https://scr.prod.internal/health

# Check API gateway logs
kubectl logs -f deployment/api-gateway | grep SCR

# Verify environment variables
kubectl exec deployment/api-gateway -- env | grep SCR
```

**Common Causes**:
- Invalid API key
- Network connectivity issues
- SCR service down

### Issue: High Latency

**Symptoms**: p99 latency > 50ms  
**Diagnosis**:
```bash
# Check SCR metrics
curl https://scr.prod.internal:9090/metrics | grep latency

# Check downstream destination latency
curl https://billing.internal/health
```

**Common Causes**:
- Downstream destination slow to respond
- Network congestion
- Insufficient SCR capacity

**Fix**:
```bash
# Scale up SCR replicas
kubectl scale deployment/scr --replicas=20

# Or: Enable async routing (don't wait for destination)
kubectl set env deployment/scr SCR_ASYNC_ROUTING=true
```

---

## Support & Documentation

**Internal Wiki**: `https://wiki.openai.com/scr`  
**Runbook**: `https://runbook.openai.com/scr`  
**Slack Channel**: `#session-completion-runtime`  
**On-Call**: `scr-oncall@openai.com`
