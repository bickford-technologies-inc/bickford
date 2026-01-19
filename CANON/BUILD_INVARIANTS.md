# Bickford Canon — Build Invariants

STATUS: ENFORCED
AUTHORITY: CI + AGENT SYSTEM

I1. No package may be imported unless it emits: - dist/index.js - dist/index.d.ts

I2. No build may execute unless: - tsc is available via `pnpm exec tsc`

I3. Node.js built-ins must use namespace imports: - import _ as fs from "fs" - import _ as crypto from "node:crypto"

I4. No return shape may exceed its canonical type definition.

I5. Exactly one package manager is allowed (pnpm).

I6. Next.js configuration must be explicit and CJS.

Violations are structural failures, not bugs.
