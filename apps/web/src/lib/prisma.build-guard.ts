/**
 * This file is imported ONLY in build-time tests.
 * If Prisma is ever instantiated at build time, CI must fail.
 */
import { PrismaClient } from "@prisma/client";

if (process.env.NEXT_PHASE === "phase-production-build") {
  throw new Error(
    "❌ PrismaClient must never be imported or constructed during next build."
  );
}

// This file should NEVER be used at runtime
void PrismaClient;
