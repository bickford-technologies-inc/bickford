# Workspace Dependency Invariant

## Incident

A production CI failure occurred when `@bickford/canon` imported
`@bickford/types` without declaring it as a dependency.

Local builds passed due to hoisting and cache effects.

## Root Cause

Turbo and TypeScript correctly enforce workspace isolation in CI.
Undeclared dependencies are not visible.

## Resolution

- Added explicit workspace dependency
- Enforced invariant at:
  - Repo lint layer
  - Canon enforcement layer
  - CI pipeline

## Invariant

> No workspace import may exist without an explicit dependency declaration.

This invariant is now mechanically enforced and cannot regress.
