import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const PKGS = path.join(ROOT, "packages");

const TEMPLATE = {
  scripts: {
    build: "pnpm exec tsc -p tsconfig.build.json",
  },
};

function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(dir, d.name));
}

for (const pkgDir of walk(PKGS)) {
  const pkgJson = path.join(pkgDir, "package.json");
  if (!fs.existsSync(pkgJson)) continue;

  const pkg = JSON.parse(fs.readFileSync(pkgJson, "utf8"));
  if (!pkg.name?.startsWith("@bickford/")) continue;

  pkg.scripts ||= {};
  pkg.scripts.build = TEMPLATE.scripts.build;

  pkg.main ||= "dist/index.js";
  pkg.types ||= "dist/index.d.ts";
  pkg.exports ||= {
    ".": {
      types: "./dist/index.d.ts",
      default: "./dist/index.js",
    },
  };

  fs.writeFileSync(pkgJson, JSON.stringify(pkg, null, 2) + "\n");
  console.log("✔ patched", pkg.name);
}
