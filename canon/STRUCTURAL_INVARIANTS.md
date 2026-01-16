# Structural Invariants — Dependency Correctness

This repository enforces dependency correctness by construction.

## Enforced Properties

- Every external import is declared in package.json
- No deep imports into src/ or dist/
- Lockfile changes require manifest changes
- All packages define explicit public exports

## Enforcement Points

- Pre-commit (authoring time)
- CI (pre-build)
- Local CLI (manual verification)

## Result

Classes of failures eliminated:

- Undeclared dependency runtime errors
- CI-only dependency failures
- Lockfile drift
- Source-coupled package boundaries

This system converts dependency correctness from a debugging activity into an invariant.

---

## Canonical Environment Precondition (2026)

> **Invariant:** No workspace resolution or build may occur unless the environment and transport layers are verified healthy.

**Enforcement:**

- All CI, Vercel, and local install/build entry points must invoke:
  - `ci/guards/ENVIRONMENT_PRECONDITION.sh`
- The script must exit 0 for execution to proceed.
- Exit codes:
  - `10` — Node version mismatch (runtime drift)
  - `20` — Registry transport failure (environment poison)

**Result:**

- Eliminates all workspace and build errors caused by environment drift or transport corruption.
- Ensures only true workspace/package errors reach the developer.
- Enables deterministic, auto-classifiable CI/CD logs.

See `CI_CD_AUTOMATION.md` for operational details.
