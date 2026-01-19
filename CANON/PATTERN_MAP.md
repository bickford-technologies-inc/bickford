# Bickford Build Failure Pattern Map

STATUS: CANONICAL
MODE: STRUCTURAL (NOT AD-HOC)
GOAL: TIME-TO-GREEN COLLAPSE

## PATTERN A — Implicit Capability Assumption

- tsc assumed present
- Node built-ins default-imported
- Package emits JS “somehow”

FIX: Explicit capability checks + enforced invariants

## PATTERN B — Package Exists, Artifact Does Not

- Workspace resolves in TS
- dist/ missing at bundle time

FIX: No import without dist/

## PATTERN C — Return Shape Drift

- status vs converged
- artifact leakage

FIX: Canonical return types only

## PATTERN D — Tooling Resolution Mismatch

- pnpm vs npm
- CJS vs ESM

FIX: Single authority + guardrails

RULE:
If a fix touches more than one file, it must be promoted to enforcement.
