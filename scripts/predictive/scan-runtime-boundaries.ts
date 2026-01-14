import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const FORBIDDEN_IMPORTS = ["@prisma/client", "fs", "child_process", "crypto"];

const APP_DIR = path.join(ROOT, "apps");

function scanFile(file: string) {
  const src = fs.readFileSync(file, "utf8");

  for (const forbidden of FORBIDDEN_IMPORTS) {
    const re = new RegExp(`^import .*${forbidden}`, "m");
    if (re.test(src)) {
      throw new Error(
        `❌ Predictive Guard: Forbidden build-time import "${forbidden}" in ${file}`
      );
    }
  }
}

function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (p.includes("/app/") && p.endsWith(".ts")) scanFile(p);
  }
}

walk(APP_DIR);

console.log("✅ Predictive Guard: Runtime boundaries validated");
