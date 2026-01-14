# Prisma Canon

## Allowed

- Import `prisma` from `@bickford/db`
- Node.js runtime only
- Prisma v7+

## Forbidden

- getPrisma()
- Dynamic factories
- Edge runtime
- Package-level Prisma clients

Violations fail:

- ESLint
- Build guard
- CI
