# Runtime Purity

This repository enforces runtime purity by construction.

Rules:

- No side effects at import time
- All side effects confined to explicit runtime entrypoints
- Resources must be lazily initialized
- Runtime-only APIs may not appear in pure modules

Enforcement:

- Pre-commit
- CI (pre-build)

Result:
Build determinism and execution order are guaranteed.
