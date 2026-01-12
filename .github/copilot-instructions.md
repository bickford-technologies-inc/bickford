# Copilot Instructions (session-completion-runtime)

## Big picture

- Monorepo (npm workspaces) for a “session completion runtime” plus the Bickford Canon decision layer.
- Core packages:
	- `packages/bickford/`: Bickford Canon + API; canonical logic lives in `packages/bickford/src/canon/` (see `invariants.ts`, `optr.ts`, `promotion.ts`, `nonInterference.ts`).
	- `packages/session-completion-runtime/`: capture/validate/route session completion events (library + examples).
	- UI packages: `packages/web-ui/`, `packages/bickford-mobile-ui/`, `packages/demo-dashboard/`.
- Architecture reference: `docs/technical/ARCHITECTURE.md`.

## How to run (real repo workflows)

- Install all workspace deps: `npm run install:all` (CI: `npm run install:ci`).
- Fast, deterministic check: `npm run smoke` (alias: `npm run quickstart`). `smoke` runs `npm --workspaces run lint` then `demo:a` + `demo:c` (see `scripts/run-smoke.mjs`).
- Presentation demos (run via `tsx`): `npm run demo:a`, `npm run demo:c`, `npm run demo:d`.
- Dev (concurrently): `npm run dev` (or `npm run dev:api|dev:web|dev:mobile`).
- Dockerized stack (API + Postgres + Redis + demo UI): `docker-compose up --build` (env files in `packages/bickford/.env`, `packages/demo-dashboard/.env`).

## Canon-specific conventions (don’t break these)

- “Hard fail” invariants are enforced mechanically (e.g. `requireCanonRefs(...)`); avoid “softening” gates.
- Denials are a first-class output: keep stable denial reason taxonomy and emit explainable deny traces.
- If you change OPTR scoring/gating, preserve determinism (avoid double-calling feature extraction; cache features once).

## Repo-specific habits

- Demos in `demo/*.ts` are executable scripts; inputs are JSONL (`demo/events*.jsonl`). Keep them offline/dummy-data friendly.
- Git auto-sync is opt-in (see `WORKFLOWS.md`): `npm run git:sync:watch` stages tracked changes only (`git add -u`) unless `GIT_SYNC_ADD_NEW=1`.

## Useful entrypoints

- Session completion runtime public API: `packages/session-completion-runtime/src/index.ts`.
- Core runtime implementation: `packages/session-completion-runtime/src/runtime.ts`.
- Integration helpers: `packages/session-completion-runtime/src/integration.ts`.
- Singleton gotcha: `captureChatSessionCompletion(...)` calls `getRuntime()`; initialize once via `getRuntime(config)` (or construct `new SessionCompletionRuntime(config)`) before using helpers.

## Collaboration style (optimize for this repo)

- Keep changes minimal/lightweight; prefer evolving existing scripts/utilities over adding new frameworks.
- When you add or change workflows, update `QUICKSTART.md` / `WORKFLOWS.md` rather than writing new docs.
