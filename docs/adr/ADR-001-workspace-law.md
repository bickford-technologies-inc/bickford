# ADR-001: Workspace Law

**Status:** Accepted  
**Date:** 2026-01-15  
**Decision Owner:** Bickford  
**Scope:** Monorepo governance, dependency resolution, CI determinism

---

## Context

The Bickford monorepo previously relied on implicit tooling behavior across:

- pnpm workspace discovery
- semver resolution
- TypeScript compilation
- CI caching (Vercel)

This created a class of failures where:

- the repository was logically correct
- but historical cache state or implicit resolution caused hard-to-debug CI failures

These failures were non-local, non-obvious, and not preventable by review alone.

---

## Decision

We adopt **Workspace Law**.

> **Invalid workspace states must be unrepresentable.**

All workspace behavior is governed by **mechanically enforced invariants**, not convention.

---

## Laws (Invariants)

### 1. Workspace Discovery Law

- Workspace globs must resolve to existing paths
- No phantom or root-level assumptions
- Enforced by CI

---

### 2. Namespace Law

- All internal packages live under `@bickford/*`
- No external package may use `workspace:*`
- No internal package may escape the workspace

---

### 3. Version Law

- All internal packages use `workspace:*`
- No semver ranges for internal dependencies
- Package versions are informational only

---

### 4. Manifest Law

- `package.json` fields are schema-locked
- Tool configuration lives outside manifests
- Root-only fields are forbidden in leaf packages

---

### 5. Compiler Law

- All compiler policy lives in `tsconfig.base.json`
- Leaf tsconfigs declare shape only
- Compiler drift is forbidden

---

### 6. Export Surface Law

- Public APIs must be explicitly enumerated
- Wildcard exports are forbidden
- Surface changes are intentional acts

---

### 7. Execution Law

- CI is the execution authority
- Local success does not override CI failure
- Cache replay is treated as historical state, not truth

---

## Enforcement

All laws are enforced by:

- preinstall CI guards
- workspace graph validation
- schema and surface checks

Violations fail CI immediately.

---

## Consequences

### Positive

- Deterministic installs
- Cache-safe builds
- Audit-grade guarantees
- Clear fault attribution

### Negative

- Reduced local flexibility
- Higher upfront rigor
- Explicit over implicit patterns

These tradeoffs are intentional.

---

## Outcome

The monorepo transitions from:

> “Debug when it breaks”

to:

> **“Invalid states cannot be expressed.”**

This ADR is binding for all future work.
