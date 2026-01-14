import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const PKG_DIR = path.join(ROOT, "packages");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : p;
  });
}

const offenders = [];

for (const pkg of fs.readdirSync(PKG_DIR)) {
  const srcDir = path.join(PKG_DIR, pkg, "src");
  if (!fs.existsSync(srcDir)) continue;

  for (const file of walk(srcDir)) {
    if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;

    const text = fs.readFileSync(file, "utf8");

    if (
      text.match(/\/packages\/.+\/src\//) ||
      text.match(/@bickford\/.+\/src\//)
    ) {
      offenders.push(file);
    }
  }
}

if (offenders.length) {
  console.error("\n❌ Forbidden cross-package src imports detected:\n");
  offenders.forEach((f) => console.error(" -", f));
  process.exit(1);
}

console.log("✅ No cross-package src imports found.");
