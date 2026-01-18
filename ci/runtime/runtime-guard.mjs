/**
 * BICKFORD RUNTIME GUARD
 * Enforced at server boot
 */

import fs from "node:fs";
import path from "node:path";

function fail(msg) {
  console.error("❌ RUNTIME GUARD FAILED:");
  console.error(msg);
  process.exit(1);
}

console.log("🔒 Bickford Runtime Guard initializing…");

/**
 * Invariant 1: index.html exists and references main entry
 */
const indexPath = path.resolve("packages/web-ui/index.html");
if (!fs.existsSync(indexPath)) {
  fail("packages/web-ui/index.html missing");
}

const indexHtml = fs.readFileSync(indexPath, "utf8");
if (!indexHtml.includes("/src/main.tsx")) {
  fail("index.html does not reference /src/main.tsx");
}

/**
 * Invariant 2: React root mount exists
 */
const mainPath = path.resolve("packages/web-ui/src/main.tsx");
if (!fs.existsSync(mainPath)) {
  fail("src/main.tsx missing");
}

const mainTsx = fs.readFileSync(mainPath, "utf8");
if (!mainTsx.includes("createRoot") || !mainTsx.includes(".render(")) {
  fail("React root is not mounted in main.tsx");
}

/**
 * Invariant 3: Converge API exists
 */
const convergeRoute = path.resolve(
  "apps/web/app/api/converge/route.ts"
);
if (!fs.existsSync(convergeRoute)) {
  fail("API route /api/converge missing");
}

/**
 * Invariant 4: Environment sanity
 */
if (!process.env.NODE_ENV) {
  fail("NODE_ENV not set");
}

console.log("✅ Runtime Guard PASSED — execution authorized");
