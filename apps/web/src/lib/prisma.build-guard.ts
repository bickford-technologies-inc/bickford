/**
 * Prisma Build Guard
 * Enforces UI-surface Prisma access + runtime constraints
 */

import fs from "node:fs";
import path from "node:path";
import glob from "fast-glob";

function fail(msg: string): never {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

const files = glob.sync("apps/web/**/*.{ts,tsx}", {
  ignore: ["**/*.d.ts"],
});

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");

  if (src.includes("@prisma/client")) {
    fail(`Illegal @prisma/client import in ${file}`);
  }

  if (/\b(prisma\s*=|new\s+PrismaClient|export\s+.*prisma)\b/.test(src)) {
    fail(`Illegal concrete Prisma usage in ${file}`);
  }
}

console.log("✔ UI_PRISMA_001 enforced: getPrisma-only access");
