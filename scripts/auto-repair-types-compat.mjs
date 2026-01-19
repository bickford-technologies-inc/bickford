import { execSync } from "node:child_process";
import fs from "fs";

console.log("🔧 auto-repair: ensuring @bickford/types compatibility surface");

execSync("pnpm --filter @bickford/types build", { stdio: "inherit" });

const indexPath = "packages/types/src/index.ts";
const compatPath = "packages/types/src/compat.ts";

const indexSrc = fs.readFileSync(indexPath, "utf8");
const compatSrc = fs.readFileSync(compatPath, "utf8");

/**
 * ❌ FORBIDDEN:
 *   export * from "./intent"
 *   export * from "./decision"
 *
 * ✅ ALLOWED:
 *   export * from "./canon"
 */

const forbiddenDirectExports = [
  /export\s+\*\s+from\s+["']\.\/intent["']/,
  /export\s+\*\s+from\s+["']\.\/decision["']/
];

for (const rx of forbiddenDirectExports) {
  if (rx.test(indexSrc)) {
    throw new Error(
      "❌ index.ts must not export intent/decision directly; use canon.ts only"
    );
  }
}

if (!/export\s+\*\s+from\s+["']\.\/canon["']/.test(indexSrc)) {
  throw new Error("❌ index.ts must export canon.ts");
}

if (!/from\s+["']\.\/canon["']/.test(compatSrc)) {
  throw new Error("❌ compat.ts must re-export from canon only");
}

console.log("✅ @bickford/types surface validated");
