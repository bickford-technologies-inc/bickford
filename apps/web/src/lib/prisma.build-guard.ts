/**
 * Prisma Build Guard
 * Enforces canonical Prisma access + runtime constraints
 */

import fs from "node:fs";
import path from "node:path";

const prismaFile = path.resolve(process.cwd(), "src/lib/prisma.ts");

const source = fs.readFileSync(prismaFile, "utf8");

// Canonical export check
if (!/export\s+(\{[^}]*\bprisma\b[^}]*\}|const\s+prisma)/.test(source)) {
  console.error(
    "❌ prisma.ts must export `prisma` (directly or via re-export)"
  );
  process.exit(1);
}

// Forbidden abstraction
if (source.includes("getPrisma")) {
  console.error("❌ getPrisma is forbidden. Import `prisma` directly.");
  process.exit(1);
}

// Runtime safety: Prisma must never run on edge
if (source.includes('runtime = "edge"') || source.includes('runtime="edge"')) {
  console.error("❌ Prisma cannot be used in Edge runtime");
  process.exit(1);
}

console.log("✅ Prisma build guard passed");
