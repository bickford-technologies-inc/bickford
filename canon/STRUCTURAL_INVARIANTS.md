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
