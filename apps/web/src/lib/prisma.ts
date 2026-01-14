import { getPrisma } from "@bickford/db";

/**
 * Canonical Prisma access for web runtime.
 * No concrete Prisma handle may be exported.
 * Runtime-only, lazy initialization via getPrisma().
 */
export { getPrisma };
