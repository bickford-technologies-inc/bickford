import "server-only";

let prisma: any = null;

export function getPrismaClient(): any {
  if (!prisma) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const PrismaClient =
      require("@prisma/client").PrismaClient || require("@prisma/client");
    prisma = new PrismaClient();
  }
  return prisma;
}
