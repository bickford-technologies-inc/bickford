import { PrismaClient } from "@prisma/client";

export const prisma =
  (globalThis as any).__bickford_prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  (globalThis as any).__bickford_prisma = prisma;
}
