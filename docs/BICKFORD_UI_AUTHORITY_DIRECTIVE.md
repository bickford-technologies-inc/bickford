# Bickford UI Authority Directive (Non-Negotiable)

You are implementing Bickford, which is an intent-first execution system.

CRITICAL UI INVARIANTS:

1. Bickford is NOT a chat application.
2. Any conversational UI must be secondary, optional, and hidden by default.
3. The primary UX is command → intent → realization.

DO NOT:
- Implement chat bubbles as the primary interface
- Show chat history on the landing page
- Use mobile chat metaphors (threads, avatars, timestamps)
- Treat ChatDock as a conversation surface

REQUIRED STRUCTURE:

- Landing page:
  - Empty canvas
  - Centered prompt
  - Mirrors Codex landing experience
  - No chat UI rendered

- Dock:
  - Command surface only
  - Single input
  - No scrollback
  - Emits Intent objects
  - Invoked via ⌘K or button
  - Hidden by default

- Intent / Decision views:
  - Log-based
  - Append-only
  - Non-conversational

If you are unsure whether a UI element looks like "chat", DO NOT IMPLEMENT IT.
When in doubt, favor silence, minimalism, and intent over interaction.

Violating these rules is a correctness error, not a design preference.
