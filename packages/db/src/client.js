/*
  Prisma v6 Note:
  @bickford/db intentionally uses a CommonJS require("@prisma/client")
  to instantiate PrismaClient. This avoids a known Prisma v6 + TypeScript +
  package `exports` resolution issue in monorepos where named/default/namespace
  imports fail despite correctly generated types. This is a compatibility choice,
  not a workaround for missing generation.
*/
/* eslint-disable @typescript-eslint/no-var-requires */
let prisma = null;
export function getPrisma() {
    if (!prisma) {
        const Prisma = require("@prisma/client");
        prisma = new Prisma.PrismaClient({
            log: ["error", "warn"],
        });
    }
    return prisma;
}
