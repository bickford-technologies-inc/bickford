/**
 * Prisma Build Guard
 * Enforces canonical Prisma access + runtime constraints
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET = path.join(ROOT, "apps/web/src/lib/prisma.ts");

function fail(msg: string): never {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(TARGET)) {
  fail("prisma.ts is missing. Canon requires a Prisma facade.");
}

const src = fs.readFileSync(TARGET, "utf8");

// ❌ Forbidden: any concrete Prisma handle
if (/\bexport\s+(const|let|var)\s+prisma\b/.test(src)) {
  fail("Direct Prisma export is forbidden. Use getPrisma().");
}
if (/\bfrom\s+['"]@prisma\/client['"]/.test(src)) {
  fail("Direct @prisma/client imports are forbidden in web.");
}

// ✅ Required: explicit getPrisma export
if (!/\bexport\s*\{\s*getPrisma\s*\}/.test(src)) {
  fail("prisma.ts must export getPrisma() as the sole Prisma accessor.");
}

// Extra safety: no re-exports of prisma symbols anywhere in web
if (/\bexport\s+.*prisma\b/.test(src)) {
  fail("No prisma symbol may be exported from web.");
}

console.log("✔ prisma.build-guard: getPrisma-only invariant satisfied");
