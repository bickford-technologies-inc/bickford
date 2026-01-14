# PATH AUTHORITY — CANONICAL INVARIANT

Timestamp: 2026-01-14T04:20:00-05:00

## Invariant

No script may assume process.cwd() represents repo root.

All paths MUST be resolved structurally from the script location.

## Rationale

- CI executors (Vercel, GitHub Actions, Turbo) do not share a cwd contract
- cwd-based scripts create ENOENT failure classes
- Path authority must be deterministic

## Enforcement

Any script accessing:

- apps/\*
- packages/\*
- root config files

MUST derive repo root via `import.meta.url`.

Violations are inadmissible.
