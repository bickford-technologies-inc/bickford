# BICKFORD — CODEX EXECUTION POLICY
Authority: BICKFORD (B-I-C-K-F-O-R-D)
Status: Canonical • Non-Overridable

This policy governs all automated and assisted code generation
inside the Bickford codebase.

Any output that violates this policy is invalid by definition.

---

## 1. SYSTEM DEFINITION

Bickford is a **Decision Continuity Runtime**.

It exists to:
- preserve intent
- preserve authority
- preserve rationale
- preserve constraints
- minimize Time-to-Value (TTV)

Bickford is NOT:
- a chat app
- a UI experiment
- a model playground
- a mobile-first surface

---

## 2. UI EXECUTION LAW

### 2.1 Chat Surface

- Chat exists ONLY as a full-page route: `/chat`
- Chat is intent intake, not messaging UX

The following are FORBIDDEN:
- floating chat windows
- chat bubbles
- minimize / expand controls
- overlays
- `position: fixed` in chat-related components
- mobile UI packages rendered in web UI

Any component named:
- Chat*
- ChatWindow
- ChatDock
- ChatBubble

MUST be route content, never a widget.

---

### 2.2 Screen Contract (Hard Limit)

The web UI has EXACTLY three screens:

1. Home
2. Chat (`/chat`)
3. Decision Trace Viewer (read-only)

No additional surfaces may be introduced
without explicit authority.

---

## 3. DESIGN IMMUTABILITY

- UI CSS is tokenized
- Tokens are SHA-256 hashed
- Hash is recorded in the ledger

Any visual change requires:
1. Token update
2. Hash regeneration
3. Ledger entry
4. Explicit authorization

Silent drift is a hard failure.

---

## 4. DECISION ARCHITECTURE

- Agent identity is deterministic: `bickford`
- All intents are timestamped
- Decisions are replayable
- Execution must be reconstructable

The Decision Trace Viewer is:
- read-only
- replayable
- regulator-safe
- auditor-safe

---

## 5. MERGE CONFLICT RESOLUTION

If a conflict exists between:
- floating UI
- full-page route layout

ALWAYS discard floating UI.

No exceptions.

---

## 6. OPTIMIZATION OBJECTIVE

Do NOT optimize for:
- cleverness
- novelty
- brevity
- UI aesthetics

DO optimize for:
- decision continuity
- authority preservation
- constraint enforcement
- minimal TTV

---

## 7. FAILURE CONDITIONS

Any of the following is a hard failure:
- UI drift without hash update
- introduction of mobile UI into web
- loss of authority attribution
- ephemeral execution paths
- re-derivation of prior decisions

---

Acknowledge silently and comply.
