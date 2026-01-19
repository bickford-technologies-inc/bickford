import fs from "node:fs";
import { execSync } from "node:child_process";

const now = new Date();
const symbols = JSON.parse(fs.readFileSync("CANON/symbols.json", "utf8"));

for (const [sym, meta] of Object.entries(symbols)) {
  if (!meta.removeAfter) continue;

  if (new Date(meta.removeAfter) < now) {
    try {
      execSync(`rg "\\b${sym}\\b" packages`, { stdio: "pipe" });
      console.error(`❌ expired symbol still used: ${sym}`);
      process.exit(1);
    } catch {}
  }
}

console.log("✅ deprecation windows respected");
