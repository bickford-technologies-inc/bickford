import { execSync } from "node:child_process";
import fs from "fs";

console.log("🔧 auto-repair: ensuring @bickford/types compatibility surface");

execSync("pnpm --filter @bickford/types build", { stdio: "inherit" });

const indexPath = "packages/types/src/index.ts";
const compatPath = "packages/types/src/compat.ts";

const indexSrc = fs.readFileSync(indexPath, "utf8");
const compatSrc = fs.readFileSync(compatPath, "utf8");

const allowedIndexExports = new Set([
  'export * from "./canon";',
  'export * from "./compat";',
]);

const indexLines = indexSrc
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean)
  .filter((l) => l.startsWith("export"));

for (const line of indexLines) {
  if (!allowedIndexExports.has(line)) {
    throw new Error(`❌ index.ts has forbidden export: ${line}`);
  }
}

if (!indexLines.includes('export * from "./canon";')) {
  throw new Error("❌ index.ts must export ./canon");
}

if (!compatSrc.includes('from "./canon"')) {
  throw new Error("❌ compat.ts must re-export from canon only");
}

console.log("✅ @bickford/types surface validated");
