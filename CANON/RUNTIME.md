# 🔒 BICKFORD RUNTIME CANON
# SCOPE: CI · BUILD · DEPLOY
# LOAD ORDER: FIRST
# STATUS: LOCKED
# VERSION: 1.0.1
# TIMESTAMP: 2026-01-18T21:05:00-05:00

OBJECTIVE:
- Minimize Time-to-Green (TTG)
- Collapse known build failure classes

HARD INVARIANTS:

- pnpm is the ONLY package manager
- pnpm exec tsc MUST succeed
- Any imported workspace package MUST emit:
  - dist/index.js
  - dist/index.d.ts
  - valid exports map
- Node builtins MUST use namespace imports
- No breaking type removals without compat

RUNTIME LAW:
Preflight > Auto-Repair (safe) > Fail Fast
