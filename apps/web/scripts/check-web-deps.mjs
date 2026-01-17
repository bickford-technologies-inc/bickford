import fs from "fs";
import path from "path";

const root = process.cwd();
const pkgPath = path.join(root, "package.json");

const REQUIRED = [
  "@bickford/web",
  "@bickford/core"
];

function main() {
  if (!fs.existsSync(pkgPath)) {
    throw new Error("[CANON_VIOLATION] apps/web missing package.json");
  }

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies
  };

  for (const dep of REQUIRED) {
    if (!deps?.[dep]) {
      throw new Error(
        "[CANON_VIOLATION] apps/web missing required dependency: " + dep
      );
    }
  }
}

main();
console.log("✔ check-web-deps passed");
