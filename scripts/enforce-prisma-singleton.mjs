/**
 * Prisma Singleton Enforcement
 * Canonical invariant: exactly one Prisma Client, generated from root schema
 * TIMESTAMP: 2026-01-13T00:00:00-05:00
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 🔒 ABSOLUTE PATH to the root-generated Prisma Client
const ROOT_PRISMA_CLIENT = path.resolve(
  __dirname,
  "../node_modules/.prisma/client/index.js"
);

let PrismaClient;
try {
  ({ PrismaClient } = await import(ROOT_PRISMA_CLIENT));
} catch (err) {
  console.error("❌ Failed to load root Prisma Client");
  console.error("Expected at:", ROOT_PRISMA_CLIENT);
  throw err;
}

const prisma = new PrismaClient();

// 🔴 Canonical invariant
if (!("chatMessage" in prisma)) {
  console.error("❌ Prisma invariant violated");
  console.error("Root Prisma Client is missing `chatMessage` delegate");
  console.error(
    "This indicates schema/client drift or multi-client generation."
  );
  await prisma.$disconnect();
  process.exit(1);
}

await prisma.$disconnect();

console.log("✅ Prisma invariant satisfied (root client verified)");
