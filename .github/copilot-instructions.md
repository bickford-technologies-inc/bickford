# Copilot Instructions (Bickford)

## Big picture (how the system fits together)
- Next.js app lives at repo root (`app/`, `next.config.js`), with API routes like `/api/execute` and `/api/ledger` described in README.【F:README.md†L1-L123】
- Execution flow: Intent → OPTR path selection → canon enforcement → execution → append-only ledger (Postgres).【F:README.md†L1-L123】
- Core packages to reference for behavior: `packages/ledger`, `packages/execution-convergence`, `packages/types`, `packages/web-ui` (plus canon/authority logic in `packages/canon` and `packages/authority`).【F:README.md†L28-L67】

## Critical workflows (use these, not generic guesses)
- Package manager: **pnpm** (repo pins `pnpm@10.28.0`) and Node 20.x. Prefer `pnpm` for scripts; CI/guards rely on it.【F:package.json†L1-L55】
- Build pipeline: `pnpm run build` runs type build, prebuild guards, intent realization, and `next build` (see `scripts/*` in `prebuild`).【F:package.json†L9-L33】
- Start server: `npm run start` (Next.js) after build; local quick start uses `npm run start` per README.【F:README.md†L12-L20】
- Deployment: push to `main` or `vercel --prod`; configuration lives in `vercel.json`.【F:README.md†L67-L87】
- Conflict resolution automation: `./resolve-and-push.sh <branch>` or `npm run resolve:push -- <branch>` (see README).【F:README.md†L120-L197】

## Repo-specific conventions
- Source-first packages (TypeScript is consumed directly; no `dist/` requirement).【F:README.md†L61-L66】
- Canon/OPTR invariants are hard gates; do not soften denial semantics. Preserve deterministic scoring paths and stable denial reasons (see canon docs in `packages/canon`).【F:README.md†L22-L51】
- Commit messages are enforced as `intent(<scope>): ...` (documented in README).【F:README.md†L181-L207】

## Integration points & dependencies
- Environment variables: `DATABASE_URL`, `BICKFORD_API_TOKEN` required; optional `GITHUB_TOKEN`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `DEMO_MODE`.【F:README.md†L103-L120】
- Ledger is append-only and persisted in Postgres; treat entries as immutable proofs.【F:README.md†L28-L51】

## When changing workflows or docs
- Update `docs/QUICKSTART.md` and `docs/WORKFLOWS.md` when altering build/run/deploy steps.【F:README.md†L120-L197】
