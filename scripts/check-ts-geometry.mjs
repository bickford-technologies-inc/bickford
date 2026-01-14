import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const PKG_DIR = path.join(ROOT, "packages");

let failed = false;

for (const pkg of fs.readdirSync(PKG_DIR)) {
  const tsconfig = path.join(PKG_DIR, pkg, "tsconfig.build.json");
  if (!fs.existsSync(tsconfig)) continue;

  const cfg = JSON.parse(fs.readFileSync(tsconfig, "utf8"));
  const rootDir = cfg.compilerOptions?.rootDir;
  const include = cfg.include?.join(", ");

  if (rootDir !== "src") {
    console.error(`❌ ${pkg}: rootDir must be \"src\"`);
    failed = true;
  }

  if (!include || !include.includes("src")) {
    console.error(`❌ ${pkg}: include must cover src/**/*`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("✅ TypeScript geometry is canonical.");
