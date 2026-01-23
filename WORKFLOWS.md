# Workflows

## CI/CD Automation

This repo includes automated CI/CD pipelines for testing, building, and deployment.

### GitHub Actions Workflows

**Continuous Integration** (`.github/workflows/ci.yml`):

- Runs on push to `main` or `develop` branches
- Runs on all pull requests to `main`
- Steps:
  1. **Test & Lint**: Runs linter, tests, and type checking
  2. **Build**: Builds all packages and uploads artifacts
  3. **Deploy to Staging**: Auto-deploys to staging on `develop` branch
  4. **Deploy to Production**: Auto-deploys to production on `main` branch

**Auto-merge** (`.github/workflows/auto-merge.yml`):

- Automatically merges Copilot bot PRs after checks pass
- Waits for all CI checks to complete
- Adds comment when auto-merge is enabled

### Available Scripts

```bash
# Development
npm start                  # Start all services (auto-setup + install)
npm run dev               # Start API + Web + Mobile concurrently
npm run dev:api           # Start API only
npm run dev:web           # Start Web UI only

# Health & Validation
npm run check             # Run health checks
npm run lint              # Lint all workspaces
npm run test              # Run tests in all workspaces
npm run typecheck         # Type check all workspaces
npm run smoke             # Fast smoke test (lint + demos)

# Deployment
npm run deploy            # Deploy to staging (default)
npm run deploy:staging    # Deploy to staging explicitly
npm run deploy:production # Deploy to production

# Build
npm run build             # Build all packages
```

### Quality Enforcement

Quality checks are enforced via **GitHub Actions CI**, not local git hooks:

- ✅ Works seamlessly in CI/CD and Vercel environments
- ✅ No setup required - runs automatically on push/PR
- ✅ PRs cannot merge until all checks pass
- ✅ No local dependencies or configuration needed

All linting, type checking, testing, and building happens in the cloud via GitHub Actions.

For the end-to-end execution workflow (intent to realized output), see [`docs/EXECUTION_WORKFLOW.md`](docs/EXECUTION_WORKFLOW.md).
For canonical chat workflows and the art of the possible, see [`docs/BICKFORD_CHAT_WORKFLOWS.md`](docs/BICKFORD_CHAT_WORKFLOWS.md).

---

## Continuous Git Sync (Auto pull/commit/push)

This repo includes an **opt-in** loop that continuously:

1. `git pull --rebase` (with autostash)
2. (optional) commit local changes
3. `git push`

### Start the loop

```bash
npm run git:sync:watch
```

Keep that terminal running.

### Safety defaults (important)

By default the sync **does not add new untracked files**. It stages only modifications/deletions to already-tracked files (`git add -u`).

This reduces the risk of accidentally committing secrets or scratch files.

If you explicitly want to auto-add new files too:

```bash
GIT_SYNC_ADD_NEW=1 npm run git:sync:watch
```

### If you don’t want it to commit

```bash
GIT_SYNC_NO_COMMIT=1 npm run git:sync:watch
```

It will still pull + push (push will be a no-op if there are no commits).

### Custom commit message

```bash
GIT_SYNC_MESSAGE="auto: savepoint" npm run git:sync
```

### What “forever” means

- This will run indefinitely **while the process is running**.
- If your Codespace stops/rebuilds, you’ll need to start it again.
- If a merge conflict happens, the loop will stop making progress until you resolve it manually.

## TypeScript Type Completeness Guard (TS7016)

A CI script is provided to enforce that no TypeScript build emits TS7016 (missing type declaration) errors. This ensures all required @types/\* devDependencies are present and type safety is never masked.

**Usage in CI:**

1. Pipe your build output to a log file (e.g., `npm run build > build.log 2>&1`)
2. Run the guard script:

```bash
bash ci/check-ts7016.sh build.log
```

If any TS7016 errors are found, CI will fail with a clear message and instructions to add the missing @types/\* package.

- Script: `ci/check-ts7016.sh`
- Canon: Additive type artifacts only; never mask TS errors

## Workspace Type Parity Script

A script is provided to check that all workspace packages using React/ReactDOM have the corresponding @types/\* devDependencies. This prevents accidental type drift and enforces type parity.

**Usage:**

```bash
node scripts/check-types-parity.js
```

- Fails with a clear message if any package is missing required @types/\*
- Can be run locally or in CI
- Script: `scripts/check-types-parity.js`

# CI Guards: Canon Authority Boundary & Turbo Graph

## Canon Authority Boundary Guard

- Script: `ci/check-canon-boundaries.mjs`
- Enforces:
  - All workspace imports must have explicit `package.json` dependency
  - All composite TS projects must reference imported workspace packages in `tsconfig.json`
- Failure mode: Hard fail with precise error message

## Turbo Graph Validator

- Script: `ci/check-turbo-graph.mjs`
- Enforces:
  - All TS project references must be present in Turbo build graph (`turbo.json`)
  - No missing or reverse dependencies
- Failure mode: Hard fail with precise error message

## Usage

Add to CI pipeline:

```sh
node ci/check-canon-boundaries.mjs
node ci/check-turbo-graph.mjs
```

---

## 🚦 Canonical Invariants Enforcement (Web Layer)

- Forbidden tokens: `canon`, `optr`, `ledger`, `authority`, `@bickford/*` must never appear in `apps/web/src`.
- All builds (local, CI, Vercel) are gated by `pnpm run preflight`.
- Violations are blocked with actionable output.
- See [`docs/INVARIANTS.md`](docs/INVARIANTS.md) for rules, examples, and remediation.
