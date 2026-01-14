/**
 * Prisma Build Guard
 * Enforces canonical Prisma access + runtime constraints
 */

import fs from "node:fs";
import path from "node:path";

const prismaFile = path.resolve(process.cwd(), "src/lib/prisma.ts");

const source = fs.readFileSync(prismaFile, "utf8");

// Canonical export check: must export getPrisma, never prisma
if (!/export\s+\{[^}]*getPrisma[^}]*\}/.test(source)) {
  console.error(
    "❌ prisma.ts must export getPrisma (never a concrete Prisma handle)"
  );
  process.exit(1);
}

// Direct access forbidden: must use getPrisma for runtime-only initialization
if (
  source.includes("import { prisma") ||
  source.includes("export const prisma")
) {
  console.error(
    "❌ Direct Prisma access is forbidden. Use getPrisma() for runtime-only initialization."
  );
  process.exit(1);
}

// Runtime safety: Prisma must never run on edge
if (source.includes('runtime = "edge"') || source.includes('runtime="edge"')) {
  console.error("❌ Prisma cannot be used in Edge runtime");
  process.exit(1);
}

console.log("✅ Prisma build guard passed");
