# ================================================================

# BICKFORD — VERCEL CODE COMPLIANCE GUIDE

# (Codespace / Repo-Root · MAX-SAFE)

# ================================================================

#

# PURPOSE:

# Ensure deterministic, non-regressive Vercel deployments.

# Eliminate ambiguity across CI/CD, workspaces, and agents.

#

# SCOPE:

# Next.js (App Router / Pages), pnpm workspaces, Prisma,

# Turbo, Node 18+/20+, Vercel Build & Runtime.

#

# ================================================================

# ------------------------------------------------

# 1) REPOSITORY & CONFIG AUTHORITY

# ------------------------------------------------

# - Git is the single source of truth.

# - Vercel UI settings MUST NOT override repo config.

# - All build behavior is declared in-repo.

REQUIRED:

- vercel.json exists at repo root (valid JSON, no comments).
- No conflicting vercel.json files in subdirectories unless intentional.
- .vercelignore is explicit and minimal.

FORBIDDEN:

- Inline comments in vercel.json
- Trailing commas
- Duplicate or shadowed config keys

# ------------------------------------------------

# 2) BUILD COMMANDS (DETERMINISTIC)

# ------------------------------------------------

# Vercel enforces `pnpm install --frozen-lockfile`.

# Your repo MUST be compatible with this invariant.

REQUIRED:

- pnpm-lock.yaml committed
- pnpm version pinned (via packageManager or engines)
- Node version pinned (engines.node or .nvmrc)

RECOMMENDED:

- "packageManager": "pnpm@<exact>"
- "engines": { "node": ">=20 <21" }

FORBIDDEN:

- Modifying pnpm-lock.yaml during CI
- Conditional install scripts
- Guessing dependency versions

# ------------------------------------------------

# 3) PNPM WORKSPACE COMPLIANCE

# ------------------------------------------------

# Workspace integrity is mandatory.

REQUIRED:

- pnpm-workspace.yaml present and accurate
- All internal packages referenced via workspace protocol
- No wildcard dependencies ("\*") in workspace packages

FORBIDDEN:

- Deleting package-level lockfiles to “fix” installs
- Cross-workspace dependency drift
- Phantom packages not declared at root

# ------------------------------------------------

# 4) PRISMA (IF USED)

# ------------------------------------------------

# Prisma client MUST be generated deterministically.

REQUIRED:

- prisma and @prisma/client pinned at workspace root
- Matching versions in dependent packages
- prisma generate wired as lifecycle invariant

REQUIRED SCRIPTS (example, per package):

- prisma:generate
- postinstall → prisma:generate
- prebuild → prisma:generate

REQUIRED PROOFS:

- Runtime: PrismaClient export exists
- Types: `import { PrismaClient } from "@prisma/client"` compiles

FORBIDDEN:

- Relying on implicit generate
- Skipping type-level proof
- Wildcard Prisma versions

# ------------------------------------------------

# 5) NEXT.JS ROUTING (STRICT)

# ------------------------------------------------

# App Router and Pages Router MUST NOT conflict.

REQUIRED:

- Choose ONE:
  - /app (App Router)
  - /pages (Pages Router)

FORBIDDEN:

- Both `pages/index.tsx` AND `app/page.tsx`
- Mixed routing without explicit migration plan

RECOMMENDED:

- App Router for new builds
- Remove legacy pages when migrating

# ------------------------------------------------

# 6) TYPESCRIPT & BUILD SAFETY

# ------------------------------------------------

# Type errors are build-stopping by default on Vercel.

REQUIRED:

- `tsc --noEmit` passes locally
- No reliance on implicit any / missing types
- All imports resolvable at build time

FORBIDDEN:

- Ignoring TS errors in CI
- Conditional type imports
- Runtime-only fixes for type failures

# ------------------------------------------------

# 7) TURBO / MONOREPO BUILDS

# ------------------------------------------------

# Turbo pipelines must be explicit and reproducible.

REQUIRED:

- turbo.json committed
- Explicit task dependencies (build → lint → test)
- Cache-safe tasks only

FORBIDDEN:

- Non-deterministic scripts
- Hidden environment-dependent behavior

# ------------------------------------------------

# 8) ENVIRONMENT VARIABLES

# ------------------------------------------------

# Secrets are injected by Vercel; shape is declared in code.

REQUIRED:

- All env vars referenced are documented
- Fallbacks are explicit or build fails

FORBIDDEN:

- Reading undeclared env vars
- Silent defaults for required secrets

# ------------------------------------------------

# 9) DEPLOYMENT INVARIANTS

# ------------------------------------------------

# Deploy only after GREEN builds.

REQUIRED:

- Local build passes
- Workspace build passes
- No unresolved warnings promoted to errors

FORBIDDEN:

- Deploying with known failures
- “It works locally” exceptions

# ------------------------------------------------

# 10) FAILURE HANDLING (MAX-SAFE)

# ------------------------------------------------

# CI/CD is a live execution surface.

RULES:

- Any failure → fetch logs automatically
- Diagnose mechanically
- Apply minimal admissible fix
- Re-run from earliest failing invariant
- NEVER ask for permission to continue

BOUNDARY:

- CONTINUOUS → continue across build/deploy failures
- ISOLATED → halt after scoped objective

# ================================================================

# COMPLIANCE CHECKLIST (PRE-DEPLOY)

# ================================================================

[ ] vercel.json valid JSON
[ ] pnpm-lock.yaml committed and in sync
[ ] Node & pnpm versions pinned
[ ] No wildcard deps in workspace
[ ] Prisma generate lifecycle enforced (if used)
[ ] Next.js routing non-conflicting
[ ] tsc --noEmit passes
[ ] turbo build passes
[ ] No UI overrides in Vercel
[ ] Logs inspected on any failure

# ================================================================

# CORE LAW (REFERENCE)

# ================================================================

# (max-safe) × (max-safe) → infinite

#

# Safety does not decay with continuation.

# Execution halts only on completion, never on precaution.

#

# ================================================================

# END — EXECUTION IS LAW

# ================================================================
