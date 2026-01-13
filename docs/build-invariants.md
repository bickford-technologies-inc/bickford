# Build Invariants — Canonical Enforcement

This document describes the canonical build invariants and enforcement mechanisms for the Bickford monorepo. It is intended as the single source of truth for CI, Copilot, and all contributors.

## Canonical Build Law

1. **Never enforce invariants before deterministic generation.**
2. **Prisma clients must be generated explicitly and synchronously.**
3. **Do not introduce multiple runtime authorities.**
4. **Do not import generated artifacts directly.**
5. **All build scripts must preserve GENERATE → VALIDATE → ENFORCE.**

## Enforcement Scripts

- `scripts/validate-repo.ts`: Scans for forbidden patterns (e.g., direct runtime authority, direct import of generated Prisma client).
- `scripts/prisma-enforce.ts`: Fails the build if Prisma client is not generated.
- `scripts/prisma-validate.ts`: (Placeholder) For future schema or artifact validation.

## CI Workflow

- CI runs `validate-repo.ts` before build.
- Build order is locked: GENERATE → VALIDATE → ENFORCE → BUILD.
- Turbo pipeline and root `package.json` enforce this order.

## Copilot Guard

- `.github/copilot-instructions.md` encodes these laws for Copilot and all future PRs.

## For New Repos

- Copy all scripts, markdown, Copilot guard, and build setup from this system.

## For Audits/Postmortems

- Hand this file as the “why” and “how” failure is prevented.

---

**Summary:**

- CI and Copilot now enforce build canon—do not violate. All new repos/changes must comply.
- This closes the loop: error cascade can no longer happen.
