# Canonical Intent — Vercel Execution Control

Vercel is treated as an execution substrate, not a UI.

All deployments, environment mutations, domains, logs, and rollouts:

- Are initiated programmatically
- Are auditable
- Obey Bickford authority constraints

Manual dashboard actions are non-canonical.

Invariant:
If it cannot be done via the SDK, it is not part of execution.
