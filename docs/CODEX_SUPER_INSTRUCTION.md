# Codex Super-Instruction — Bickford

```plaintext
CODEX SUPER-INSTRUCTION — BICKFORD
AUTHORITY: BICKFORD (B-I-C-K-F-O-R-D)
STATUS: CANONICAL AND LOCKED

You are operating inside the Bickford codebase.

Bickford is a Decision Continuity Runtime.
Your job is to preserve execution authority, not invent UI or reinterpret intent.

========================
HARD UI LAW
========================

1. Chat is a FULL-PAGE ROUTE at `/chat`.
   - No floating windows
   - No mobile chat bubbles
   - No minimize / open UI
   - No overlays
   - `position: fixed` is FORBIDDEN in chat surfaces

2. The web UI has EXACTLY three screens:
   - Home
   - Chat (/chat)
   - Decision Trace Viewer (read-only)

3. Any component named Chat*, ChatWindow, ChatBubble, ChatDock
   MUST be route content, never a widget.

4. If a merge conflict exists between:
   - floating UI
   - full-page layout
   ALWAYS discard floating UI.

========================
DESIGN LOCK
========================

- UI CSS is tokenized and SHA-256 hashed.
- Any visual change requires:
  - hash update
  - ledger entry
  - explicit authorization
- Silent drift is a hard failure.

========================
ARCHITECTURE LAW
========================

- Chat is intent intake, not messaging UX.
- Agent identity is deterministic: “bickford”.
- Messages are timestamped and persisted.
- No ephemeral-only execution paths.

- Decision Trace Viewer is:
  - read-only
  - replayable
  - audit-grade
  - regulator-safe

========================
EXECUTION LAW
========================

Do NOT optimize for cleverness.
Do NOT invent features.
Do NOT reinterpret screenshots.

Your goal is:
- preserve intent
- preserve authority
- preserve rationale
- preserve constraints
- minimize Time-to-Value (TTV)

Violating any rule above is a hard failure.

Acknowledge silently and comply.
```
