# Canonical Intent — Build & Deploy

Objective:
- Deterministic, green Vercel builds across all apps and packages
- Enforced toolchain authority (Node / pnpm)
- Explicit separation of developer instruction vs runtime intent
- Streaming- and reasoning-ready execution surface

Non-goals:
- No background workers
- No databases
- No authentication
- No Edge-only dependencies

Invariant:
A failed build is an authority violation, not a transient error.
