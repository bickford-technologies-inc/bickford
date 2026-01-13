import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __bickford_prisma__: PrismaClient | undefined;
}

export const prisma =
  global.__bickford_prisma__ ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__bickford_prisma__ = prisma;
}
