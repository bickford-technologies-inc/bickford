# Canonical Intent — Vercel Integration Storage

Execution flow is mandatory:

1. Discover integration configuration
2. List products via configuration
3. Validate metadata against product schema
4. Provision store via direct integration endpoint

Rules:
- No blind provisioning
- No schema-less metadata
- Free vs paid plans resolved by Vercel
- Bickford executes, Vercel provisions

Failure at any step is an authority refusal.
