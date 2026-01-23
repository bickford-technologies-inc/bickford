# Execution Workflow — Intent to Realized Output

## Objective

Provide a deterministic, auditable workflow for executing intent in Bickford—from declaration to build, deployment, and evidence capture.

## System Entry Points

- **Intent declaration:** `intent.json` acts as the declared target state that Bickford must realize.
- **Execution boundary:** `pnpm run build` is the canonical pipeline for realizing intent in production contexts. It chains type compilation, prebuild guards, intent realization, and the Next.js build.
- **Operational guardrails:** Preinstall and prebuild scripts enforce invariants before any execution is allowed.

## Workflow Architecture (Phased)

### 1) Declare intent (Intent → Decision)

1. Write or update `intent.json` to express the target outcome and constraints.
2. Bickford parses intent and computes the admissible execution path (policy selection).
3. The selected policy must remain within the constraints enforced by the prebuild guards.

**Outputs:** intent specification ready for realization.

### 2) Prepare execution environment (Preinstall + Toolchain)

1. **Lockfile invariant:** `preinstall` ensures `pnpm-lock.yaml` exists before installs.
2. **Toolchain validation:** the runtime must conform to the declared tooling and version constraints.

**Outputs:** validated dependency graph and environment preconditions.

### 3) Build type system (Structure → Enforcement)

1. `pnpm run build:types` compiles shared types (`@bickford/types`).
2. Any structural mismatches (missing types, incompatible schemas) halt execution.

**Outputs:** structurally complete type artifacts.

### 4) Enforce prebuild guards (Authority → Execution Law)

`pnpm run prebuild` executes canonical invariants that gate runtime behavior:

- Workspace dependency graph checks
- SDK boundary enforcement
- Node + environment validation
- Vercel binding checks
- Chat design lock verification
- Execution authority guard
- Environment precondition guard

**Outputs:** authoritative pass/fail evidence for every guard.

### 5) Realize intent (Intent → Artifact)

`pnpm run realize-intent` transforms the intent declaration into executable artifacts that the build system consumes.

**Outputs:** intent-aligned artifacts and readiness for runtime build.

### 6) Build and deploy (Execution → Reality)

`pnpm run build` runs the Next.js production build, producing deployable assets and functions.

**Outputs:** production-ready bundles and serverless outputs.

### 7) Observe & persist (Evidence → Ledger)

1. Build artifacts and execution traces are emitted during the pipeline.
2. Execution evidence is persisted as append-only data (ledger and trace artifacts).

**Outputs:** audit trail that proves execution and enforcement.

## Failure Handling (Deterministic)

- Any guard failure halts the workflow.
- Failures must be recorded as evidence (guard output, logs, or artifacts).
- No execution proceeds without validated authority.

## Local Testing Expectations

- Tests are mandatory to close knowledge gaps before realizing intent.
- Minimum validation is a type build + prebuild guard run; additional tests are encouraged for feature changes.
- Capture guard output logs as evidence when running required validations.

## Canonical Command Path

```bash
pnpm run build:types
pnpm run prebuild
pnpm run realize-intent
pnpm run build
```

These steps provide the deterministic path from intent declaration to verified execution.
