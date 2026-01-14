# Bickford Canon v1.0 — Package Authority

## Invariant 1 — Explicit Dependency

A package may only import packages listed in its own `package.json`.

## Invariant 2 — Export Authority

A package may only import symbols exposed via another package’s `exports` map.

## Invariant 3 — No Deep Imports

No import may reference another package’s internal file structure (`/src/*`).

## Invariant 4 — Export Parity

All runtime exports must have matching TypeScript declarations.

## Invariant 5 — Ledgered Compliance

Every production build must emit a Canon Compliance Certificate.

## Enforcement

Violations are mechanically rejected at:

- CI
- Build
- Deploy

## Status

LOCKED — v1.0
