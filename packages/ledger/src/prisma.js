/* eslint-disable @typescript-eslint/no-var-requires */
const Prisma = require("@prisma/client");

export const prisma = new Prisma.PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "warn", "error"]
      : ["error"],
});
