# Decision Trace Viewer — Execution Plan (One-Week Build)

## 1. Exact UI Wireframe (Locked)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ bickford / Decision Trace Viewer                                Read-only ✅ │
├──────────────────────────────────────────────────────────────────────────────┤
│ Decision Card (Above the fold)                                               │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ Decision Type: Execution Halt          Status: ✅ Enforcement Succeeded  │ │
│ │ Severity: Hard-Stop                    Timestamp: 2026-01-16 01:39:23Z   │ │
│ │ Hash: sha256:... [Copy]                Environment: vercel / pdx1        │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│ Timeline — From Intent → Enforcement                                         │
│  ● Intent Received        “Install dependencies”                              │
│  │                                                                       Time │
│  ● Policy Evaluated       “No undefined execution allowed”                   │
│  │                                                                            │
│  ● Violation Detected     “Required guard missing”                            │
│  │                                                                            │
│  ● Authority Enforced     “Execution halted before install”                   │
│  │                                                                            │
│  ● Artifact Emitted       “build-diagnosis.json”                              │
├──────────────────────────────┬───────────────────────────────────────────────┤
│ Authority Pane               │ Integrity Pane                                │
│ ┌──────────────────────────┐ │ ┌───────────────────────────────────────────┐ │
│ │ Enforcement Policy       │ │ │ Artifact Hash (SHA-256)                    │ │
│ │ Guard Name               │ │ │ Previous Hash (Chain)                      │ │
│ │ Exit Condition           │ │ │ Environment Metadata                       │ │
│ │ Non-bypassability        │ │ │ Read-only Mode: Enforced                   │ │
│ └──────────────────────────┘ │ └───────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│ Export                                                                    ▼  │
│ [Download JSON] [Download PDF] [Download ZIP]                                │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Interaction rules:**

- No edit paths; strictly read-only.
- Deterministic language only (“Enforced”, “Denied”, “Satisfied”).
- Monospace for hashes and IDs; dark mode first.

---

## 2. Artifact Schema v1 (Formal)

### Canonical Schema

```
{
  "schema": "bickford.decision-trace.v1",
  "timestamp": "2026-01-16T01:39:23Z",
  "decision": {
    "type": "execution_halt",
    "classification": "missing_guard",
    "severity": "hard-stop",
    "status": "enforced"
  },
  "intent": {
    "text": "Install dependencies",
    "actor": "operator",
    "environment": "vercel"
  },
  "authority": {
    "enforced_by": "precondition_guard",
    "policy": "no_undefined_execution",
    "non_bypassable": true
  },
  "evidence": {
    "exit_code": 127,
    "command": "bash ci/guards/ENVIRONMENT_PRECONDITION.sh",
    "artifact": "build-diagnosis.json"
  },
  "environment": {
    "commit": "061eb46",
    "executor": "vercel",
    "region": "pdx1"
  },
  "integrity": {
    "hash": "sha256:...",
    "prev_hash": "sha256:...",
    "read_only": true
  }
}
```

### JSON Schema (v1)

```
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://bickford.ai/schemas/decision-trace.v1.json",
  "title": "Decision Trace Artifact",
  "type": "object",
  "required": [
    "schema",
    "timestamp",
    "decision",
    "intent",
    "authority",
    "evidence",
    "environment",
    "integrity"
  ],
  "properties": {
    "schema": {
      "type": "string",
      "const": "bickford.decision-trace.v1"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time"
    },
    "decision": {
      "type": "object",
      "required": ["type", "classification", "severity", "status"],
      "properties": {
        "type": {"type": "string"},
        "classification": {"type": "string"},
        "severity": {"type": "string"},
        "status": {"type": "string"}
      }
    },
    "intent": {
      "type": "object",
      "required": ["text", "actor", "environment"],
      "properties": {
        "text": {"type": "string"},
        "actor": {"type": "string"},
        "environment": {"type": "string"}
      }
    },
    "authority": {
      "type": "object",
      "required": ["enforced_by", "policy", "non_bypassable"],
      "properties": {
        "enforced_by": {"type": "string"},
        "policy": {"type": "string"},
        "non_bypassable": {"type": "boolean"}
      }
    },
    "evidence": {
      "type": "object",
      "required": ["exit_code", "command", "artifact"],
      "properties": {
        "exit_code": {"type": "integer"},
        "command": {"type": "string"},
        "artifact": {"type": "string"}
      }
    },
    "environment": {
      "type": "object",
      "required": ["commit", "executor", "region"],
      "properties": {
        "commit": {"type": "string"},
        "executor": {"type": "string"},
        "region": {"type": "string"}
      }
    },
    "integrity": {
      "type": "object",
      "required": ["hash", "prev_hash", "read_only"],
      "properties": {
        "hash": {"type": "string"},
        "prev_hash": {"type": "string"},
        "read_only": {"type": "boolean"}
      }
    }
  }
}
```

---

## 3. Two-Page Technical Overview (Condensed)

### Page 1 — What the Viewer Proves

**Objective:** Make enforcement visible, deterministic, and auditable.

**Core claim:** The Decision Trace Viewer renders proof objects, not explanations.
Every action shown is backed by a signed artifact produced by the runtime.

**Inputs:** A decision artifact conforming to `bickford.decision-trace.v1`.

**Outputs:**

- Deterministic evidence of enforcement
- Authority provenance (policy + guard)
- Integrity validation (hash + chain)
- Exportable artifacts (JSON, PDF, ZIP)

**Regulator Questions Answered:**

1. **What decision was made?** (Decision Card)
2. **Why was it made?** (Authority Pane)
3. **What authority enforced it?** (Guard + Policy)
4. **Can this record be trusted?** (Integrity Pane)

**Non-Negotiables:**

- Read-only UI only
- Deterministic language
- No “model reasoning” or subjective narrative
- Hashes and chain visible

### Page 2 — Architecture & Build Plan

**System Components:**

- **Artifact Loader**: reads JSON artifact, validates schema v1.
- **Trace Renderer**: maps decision fields into UI panes and timeline.
- **Integrity Verifier**: validates hash, displays chain metadata.
- **Export Service**: JSON/PDF/ZIP serialization.

**Week Plan (Execution-Grade):**

- **Day 1:** Implement schema validation + load sample artifact
- **Day 2:** Build Decision Card + Timeline UI
- **Day 3:** Build Authority + Integrity panes
- **Day 4:** Add export endpoints and PDF/ZIP generation
- **Day 5:** End-to-end demo with link-shareable viewer

**Security Posture:**

- Read-only surfaces only
- No auth required for demo; trust comes from artifact integrity
- No side effects (no mutation)

**Success Criteria:**

- Regulator can answer all four questions in <30 seconds
- Artifact hashes match across export formats
- Viewer is link-shareable without leaking secrets

---

## 4. Deliverables (Week 1)

- Decision Trace Viewer UI (read-only)
- Artifact schema v1 validation
- Exportable evidence package
- Two-page technical overview (this document)
