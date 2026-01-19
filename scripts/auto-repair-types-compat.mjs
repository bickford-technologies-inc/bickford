import { execSync } from "node:child_process";
import fs from "fs";

console.log("🔧 auto-repair: ensuring @bickford/types compatibility surface");

execSync("pnpm --filter @bickford/types build", { stdio: "inherit" });

const index = "packages/types/src/index.ts";
const compat = "packages/types/src/compat.ts";

const indexSrc = fs.readFileSync(index, "utf8");
const compatSrc = fs.readFileSync(compat, "utf8");

if (
  indexSrc.includes('from "./intent"') ||
  indexSrc.includes('from "./decision"')
) {
  throw new Error("❌ index.ts must not export intent/decision directly");
}

if (!compatSrc.includes('from "./canon"')) {
  throw new Error("❌ compat.ts must re-export from canon only");
}

console.log("✅ @bickford/types surface validated");
