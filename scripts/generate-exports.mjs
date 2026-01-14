import fs from "node:fs";
import path from "node:path";

const packagesDir = path.resolve("packages");

for (const pkg of fs.readdirSync(packagesDir)) {
  const pkgPath = path.join(packagesDir, pkg);
  const pkgJsonPath = path.join(pkgPath, "package.json");
  const srcIndex = path.join(pkgPath, "src", "index.ts");

  if (!fs.existsSync(pkgJsonPath) || !fs.existsSync(srcIndex)) continue;

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));

  const exportsMap = {
    ".": {
      types: "./dist/index.d.ts",
      import: "./dist/index.js",
      require: "./dist/index.js",
    },
  };

  pkgJson.exports = exportsMap;
  pkgJson.main = "./dist/index.js";
  pkgJson.types = "./dist/index.d.ts";

  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + "\n");
  console.log(`✅ exports locked for @bickford/${pkg}`);
}
