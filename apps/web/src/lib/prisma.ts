import { PrismaClient } from "@prisma/client";

/**
 * BICKFORD CANON:
 * Prisma is a runtime-only execution dependency.
 * Build-time evaluation is a structural violation.
 */

declare global {
  // eslint-disable-next-line no-var
  var __bickford_prisma__: PrismaClient | undefined;
}

/**
 * Canonical Prisma accessor.
 *
 * HARD RULES:
 * - Never instantiate Prisma at module load
 * - Never allow Prisma in Edge runtime
 * - Never run Prisma during next build
 */
export function getPrisma(): PrismaClient {
  // 🚫 Edge runtime guard (hard fail)
  if (process.env.NEXT_RUNTIME === "edge") {
    throw new Error(
      "PrismaClient is not allowed in Edge runtime. Use a server runtime or adapter."
    );
  }

  // ✅ Singleton in Node runtime
  if (!globalThis.__bickford_prisma__) {
    globalThis.__bickford_prisma__ = new PrismaClient();
  }

  return globalThis.__bickford_prisma__;
}
