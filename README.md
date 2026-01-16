# Bickford

![Canon](https://img.shields.io/badge/Bickford-Canon%20Clean-brightgreen)

**Intent → Reality in <5 seconds**

Zero-approval execution runtime with OPTR gating, canon enforcement, and immutable ledger.

## Quick Start

```bash
git clone https://github.com/bickfordd-bit/bickford.git
cd bickford
npm run start
```

Open http://localhost:3000

## What This Is

Bickford is an execution authority layer that:

1. **Accepts natural language intent** (e.g. "Add retry logic to API client")
2. **Computes optimal execution path** (OPTR engine)
3. **Enforces canonical rules** (SHA-256 verification)
4. **Executes changes** (code generation + commit)
5. **Records immutably** (append-only ledger)

No approval gates. No manual steps. No "save draft" buttons.

## Architecture

- **OPTR Engine** - Optimizes Time-to-Value across decision paths
- **Canon Authority** - SHA-256 gated execution (hash mismatch = ABORT)
- **Ledger** - Append-only Postgres log (every execution recorded)
- **Session Completion** - Event capture with <5ms p99 latency
- **Claude Integration** - Optional AI-powered intent parsing

## Deployment

**Production:** https://bickford.vercel.app

**Deploy:** `git push origin main` (auto-deploys via Vercel)

## API

### Execute Intent

```bash
POST /api/execute
Authorization: Bearer {BICKFORD_API_TOKEN}
Content-Type: application/json

{
  "intent": "Add health check endpoint"
}
```

### Query Ledger

```bash
GET /api/ledger?limit=10
```

### Canon Status

```bash
GET /api/canon
```

## Environment Variables

Required:

- `DATABASE_URL` - Postgres connection
- `BICKFORD_API_TOKEN` - API authentication

Optional:

- `GITHUB_TOKEN` - Auto-commit to GitHub
- `ANTHROPIC_API_KEY` - Claude intent parsing
- `DEMO_MODE=true` - Safe demo mode (no real execution)

## Docs

- [Quickstart Guide](docs/QUICKSTART.md)
- [API Reference](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Acquisition Docs](docs/ACQUISITION.md)

## Quick Conflict Resolution Script

To automate staging, committing, and pushing after resolving merge conflicts, use the provided script:

```sh
./resolve-and-push.sh <your-branch>
```

- Stages all changes, commits with a standard message, and pushes your branch.
- Place resolved files in the index before running, or let the script add all changes.
- Script location: `resolve-and-push.sh` (repo root)
- Make executable if needed:
  ```sh
  chmod +x resolve-and-push.sh
  ```

**Example:**

```sh
./resolve-and-push.sh copilot/lovely-pig
```

After pushing, you can merge the PR on GitHub.

## 🔁 One-Command Conflict Resolution (All Platforms)

### 1️⃣ Canonical Shell Script (macOS/Linux)

- Location: `scripts/resolve-and-push.sh`
- Usage:
  ```sh
  ./scripts/resolve-and-push.sh <branch>
  # or via npm:
  npm run resolve:push -- <branch>
  ```
- Makes sure you rebase on main, commit, and push in one go.

### 2️⃣ Windows PowerShell Variant

- Location: `scripts/resolve-and-push.ps1`
- Usage:
  ```powershell
  .\scripts\resolve-and-push.ps1 <branch>
  ```

### 3️⃣ npm Script (Cross-Platform)

- In `package.json`:
  ```json
  "scripts": {
    "resolve:push": "sh ./scripts/resolve-and-push.sh"
  }
  ```
- Usage:
  ```sh
  npm run resolve:push -- <branch>
  ```

### 4️⃣ VS Code Task (One-Click)

- Location: `.vscode/tasks.json`
- Usage:
  - Cmd-Shift-P → "Run Task" → Resolve & Push Branch
  - Enter branch name when prompted

---

**Intent → Execution:**

- No partial state, no forgotten push, no branch drift.
- All resolution paths converge to a single executable action.

---

For further hardening (build checks, OPTR-aware commits, CI bot, etc.), see script comments or ask for an advanced variant.

## If This Repo Exists, Bickford Is Usable

Test:

1. Clone repo
2. Run `npm run start`
3. Submit intent
4. Get ledger hash back in <5 seconds

If any step fails, the consolidation is incomplete.

## 🔒 Canonical Merge Boundary (Bickford Law)

### 1️⃣ Local Script (Shell/Node)

- `scripts/resolve-and-push.sh` (shell)
- `scripts/resolve-and-push.mjs` (Node.js, cross-platform)
- Both require: clean tree, rebase on main, build passes, intent-encoded commit, push, and print PR merge URL.

### 2️⃣ npm Script (Canonical Entry)

- In `package.json`:
  ```json
  "resolve:push": "node ./scripts/resolve-and-push.mjs"
  ```
- Usage:
  ```sh
  npm run resolve:push -- <branch>
  ```

### 3️⃣ Commit Message Enforcement (Intent Law)

- `.husky/commit-msg` blocks non-`intent(<scope>): ...` commits.
- Example: `intent(canon): promote authority types`

### 4️⃣ CI Merge Gate (Server-Side)

- `.github/workflows/merge-gate.yml` enforces build on PRs to main.
- No PR merges unless build passes (identical to local law).

### 5️⃣ Merge URL Auto-Open

- After push, both scripts print the PR merge URL for immediate action.

---

**Invariant:**

> No branch can reach main unless it rebases, builds, encodes intent, and passes CI. No alternate path.

---

This is the only supported merge path. All other routes are blocked by law.

## Source-First Mode (Launch Default)

All internal `@bickford/*` packages are consumed as source by the web app. Next.js transpiles all workspace dependencies via `transpilePackages` in `apps/web/next.config.mjs`.

- No `dist/` output is required for web builds.
- No package is required to emit `dist/index.js` for the web app.
- This is the canonical invariant for launch velocity and reproducibility.

---

## 🚦 Canonical Invariants & Enforcement

**Web layer separation is enforced mechanically.**

- Forbidden tokens: `canon`, `optr`, `ledger`, `authority`, `@bickford/*` must never appear in `apps/web/src`.
- All builds (local, CI, Vercel) are gated by `pnpm run preflight`.
- Violations are blocked with actionable output.
- See [`docs/INVARIANTS.md`](docs/INVARIANTS.md) for rules, examples, and remediation.

## Execution Guard Enforcement & Diagnosis Artifact

This repository enforces CI/CD execution authority using guard scripts and canonical failure artifacts.

- **Guard check:** `ci/guards/check-guards.sh` ensures all required guard scripts exist and are executable before any install/build step.
- **On failure:** Emits a deterministic, machine-verifiable `build-diagnosis.json` with root cause, canonical interpretation, and remediation steps.
- **Invariant:** No execution step may occur unless all declared enforcement guards are present and executable.

**Vercel Install Command Example:**

```bash
bash ci/guards/check-guards.sh && \
bash ci/guards/ENVIRONMENT_PRECONDITION.sh && \
corepack enable && \
corepack prepare pnpm@9.15.0 --activate && \
pnpm install --frozen-lockfile
```

See `ci/guards/check-guards.sh` for details.

## Canonical Vercel Install Command (Absolute, Debug-Proof)

To guarantee guard execution regardless of Vercel working directory or project root settings, use this install command:

```bash
echo "[DEBUG] pwd=$(pwd)" && \
echo "[DEBUG] repo root files:" && \
ls -l && \
echo "[DEBUG] ci tree:" && \
ls -lR ci || true && \
bash "$(git rev-parse --show-toplevel)/ci/guards/ENVIRONMENT_PRECONDITION.sh" && \
corepack enable && \
corepack prepare pnpm@9.15.0 --activate && \
pnpm install --frozen-lockfile
```

- This resolves the Git root and executes the guard by absolute path, bypassing all Vercel context ambiguity.
- The `ls` output will prove file visibility in the build log.
- Use this as your Vercel **Install Command** for deterministic, debug-proof enforcement.
