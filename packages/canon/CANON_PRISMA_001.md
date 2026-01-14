# CANON_PRISMA_001 — Runtime-Only Prisma Access

## Law
Prisma may only be accessed at runtime via a lazy accessor (`getPrisma()`).
No concrete Prisma handle may be imported, exported, or instantiated in web-facing code.

## Enforced By
- apps/web/src/lib/prisma.build-guard.ts
- CI prebuild execution
- Zero-bypass hard failure

## Forbidden
- import { PrismaClient } from "@prisma/client"
- export const prisma = …
- Any re-export of prisma symbols
- Any build-time Prisma initialization

## Required
- export { getPrisma } from a single facade file
- All Prisma access must call getPrisma() at runtime

## Rationale
- Prevents build-time DB initialization
- Prevents edge/runtime contamination
- Eliminates “works locally, fails on Vercel” class entirely

## Status
LOCKED — violation requires canon amendment

Timestamp: 2026-01-14T05:50:00-05:00
