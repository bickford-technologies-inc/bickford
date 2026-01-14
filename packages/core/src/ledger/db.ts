import "server-only";
import { getPrisma } from "@bickford/db";
import type { PrismaClient } from "@bickford/db";

export function getPrismaClient(): PrismaClient {
  return getPrisma();
}
