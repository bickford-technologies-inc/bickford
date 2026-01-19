import fs from "fs";
import path from "path";

const PKG_DIR = "packages";

for (const pkg of fs.readdirSync(PKG_DIR)) {
  const pkgPath = path.join(PKG_DIR, pkg);
  const pkgJsonPath = path.join(pkgPath, "package.json");

  if (!fs.existsSync(pkgJsonPath)) continue;

  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  const hasBuild = Boolean(pkgJson.scripts?.build);

  if (hasBuild) {
    const srcPath = path.join(pkgPath, "src");
    if (!fs.existsSync(srcPath)) {
      console.error(
        `❌ BUILD INVARIANT VIOLATION: ${pkg} declares build script but has no src/`
      );
      process.exit(1);
    }
  }
}

console.log("✅ All buildable packages have valid inputs");
