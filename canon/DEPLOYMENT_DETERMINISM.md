# Deployment Determinism

Deployments are pure functions of commit hashes.

Rules:

- Build once
- Deploy artifacts
- No build-time env access
- Locked toolchain
- Hash-addressed outputs

Result:
Production behavior is reproducible and auditable.
