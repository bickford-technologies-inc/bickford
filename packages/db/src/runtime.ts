let prismaSingleton: any;

export async function getPrisma() {
  if (!prismaSingleton) {
    const { PrismaClient } = await import("@prisma/client");
    prismaSingleton = new PrismaClient();
  }
  return prismaSingleton;
}
