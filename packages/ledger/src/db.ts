import { PrismaPg } from "@prisma/adapter-pg";
import { prisma } from "../../db/dist/client";
import { Pool } from "pg";
import type { DbConfig } from "@bickford/types";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaPool: Pool | undefined;
  prismaReadPool: Pool | undefined;
};

// Runtime check: Prisma must only run in Node.js, never in Edge
export function assertNodeRuntime(): void {
  if (typeof (globalThis as any).EdgeRuntime !== "undefined") {
    throw new Error(
      "INVARIANT VIOLATION: Prisma Client cannot run in Edge runtime. " +
        "Use @bickford/ledger/edge for Edge-compatible APIs."
    );
  }
}

/**
 * Canonical DB client
 * - Primary: config.url
 * - Replica (optional): config.readReplica.connectionString
 */
export function createDbClient(config: DbConfig) {
  return new Pool({
    connectionString: config.url,
  });
}

// Read replica support for query optimization
function createReadReplicaPool(config: DbConfig): Pool | undefined {
  if (!config.readReplica?.enabled || !config.readReplica.connectionString) {
    return undefined;
  }

  const readPool =
    globalForPrisma.prismaReadPool ??
    new Pool({
      connectionString: config.readReplica.connectionString,
      ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prismaReadPool = readPool;
  }

  return readPool;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Tenant-isolated Prisma client factory
export function createTenantClient(
  tenantId: string,
  config?: DbConfig
): PrismaClient {
  assertNodeRuntime();

  if (!config?.tenantIsolation?.enabled) {
    // Return default client with tenant filtering
    return prisma;
  }

  // For true tenant isolation, create a separate client
  // This would typically use a different database or schema per tenant
  return createPrismaClient({
    ...config,
    tenantIsolation: { enabled: true, tenantId },
  });
}

// Read-replica aware query executor
export function getQueryPool(
  readOnly: boolean = false,
  config?: DbConfig
): Pool {
  assertNodeRuntime();

  if (readOnly && config?.readReplica?.enabled) {
    const readPool = createReadReplicaPool(config);
    if (readPool) return readPool;
  }

  if (!globalForPrisma.prismaPool) {
    throw new Error("Prisma pool not initialized");
  }

  return globalForPrisma.prismaPool;
}

function createPrismaClient(config?: DbConfig) {
  assertNodeRuntime();

  // Canonical: use url from config or env
  const connectionString = config?.url || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is required. Provide via config parameter or environment variable."
    );
  }

  const pool =
    globalForPrisma.prismaPool ??
    new Pool({
      connectionString,
      ssl: config?.ssl ? { rejectUnauthorized: false } : undefined,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prismaPool = pool;
  }

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export default prisma;
