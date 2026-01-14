import "server-only";
import { prisma } from "@bickford/db";
import type { PrismaClient } from "@bickford/db";

export function getPrismaClient(): PrismaClient {
  return prisma;
}
