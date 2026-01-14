import { prisma } from "@bickford/db";

declare global {
  // eslint-disable-next-line no-var
  var __bickfordPrisma: typeof prisma | undefined;
}

const db = globalThis.__bickfordPrisma ?? prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.__bickfordPrisma = db;
}

export { db as prisma };
