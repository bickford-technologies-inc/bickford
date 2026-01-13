import { PrismaClient } from "@prisma/client";

const isVercel = !!process.env.VERCEL;

export const prisma = new PrismaClient({
  ...(isVercel
    ? {} // let Prisma auto-select the correct engine
    : {
        engineType: "client",
      }),
});
