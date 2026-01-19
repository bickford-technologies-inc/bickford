import fs from "fs";
import path from "path";

const PKG = "packages/vercel-integration";
const pkg = JSON.parse(fs.readFileSync(path.join(PKG, "package.json"), "utf8"));

const srcDir = path.join(PKG, "src");

const imports = fs
  .readdirSync(srcDir)
  .flatMap(
    (f) =>
      fs
        .readFileSync(path.join(srcDir, f), "utf8")
        .match(/from\s+["']([^"']+)["']/g) || [],
  )
  .map((i) => i.match(/["']([^"']+)["']/)[1])
  .filter((i) => !i.startsWith("."));

for (const dep of imports) {
  if (!pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]) {
    console.error(`❌ Undeclared dependency: ${dep}`);
    process.exit(1);
  }
}

console.log("✅ All imports declared");
