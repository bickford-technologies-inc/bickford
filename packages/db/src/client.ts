/*
  Prisma v6 Note:
  @bickford/db intentionally uses a CommonJS require("@prisma/client")
  to instantiate PrismaClient. This avoids a known Prisma v6 + TypeScript +
  package `exports` resolution issue in monorepos where named/default/namespace
  imports fail despite correctly generated types. This is a compatibility choice,
  not a workaround for missing generation.
*/
/* eslint-disable @typescript-eslint/no-var-requires */

const Prisma = require("@prisma/client");

declare global {
  // eslint-disable-next-line no-var
  var __bickford_prisma__: InstanceType<typeof Prisma.PrismaClient> | undefined;
}

export const prisma =
  global.__bickford_prisma__ ??
  new Prisma.PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__bickford_prisma__ = prisma;
}
