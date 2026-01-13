/**
 * Canonical Prisma Client
 * Build-safe, Turbopack-safe, Prisma v7 compliant
 */

import { PrismaClient } from "@prisma/client";

declare global {
  // Prevent multiple instances in dev
  // eslint-disable-next-line no-var
  var __bickfordPrisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__bickfordPrisma ??
  new PrismaClient(
    process.env.VERCEL
      ? {} // Let Prisma auto-select engine on Vercel
      : { engineType: "client" }
  );

if (process.env.NODE_ENV !== "production") {
  globalThis.__bickfordPrisma = prisma;
}
