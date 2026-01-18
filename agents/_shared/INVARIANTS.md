<!-- agents/_shared/INVARIANTS.md -->

RULE 1 — PACKAGE BOUNDARIES

- An agent may ONLY modify files in its WRITE_SCOPE
- Cross-package changes require coordination via types agent

RULE 2 — DIST EMISSION

- No @bickford/\* package may be imported unless it emits:
  - dist/index.js
  - dist/index.d.ts
  - package.json { main, types, exports }

RULE 3 — TYPE AUTHORITY

- Runtime shapes MUST match canonical types
- No extra fields allowed in returns

RULE 4 — BUILD MUST PASS

- pnpm run preflight
- pnpm -r build
