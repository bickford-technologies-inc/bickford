import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const PKGS = path.join(ROOT, "packages");

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(dir, d.name));
}

let repaired = false;

for (const pkgDir of walk(PKGS)) {
  const pkgJsonPath = path.join(pkgDir, "package.json");
  if (!fs.existsSync(pkgJsonPath)) continue;

  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  if (!pkg.name?.startsWith("@bickford/")) continue;

  let changed = false;

  pkg.scripts ||= {};
  if (!pkg.scripts.build) {
    pkg.scripts.build = "pnpm exec tsc -p tsconfig.build.json";
    changed = true;
  }

  if (!pkg.main) {
    pkg.main = "dist/index.js";
    changed = true;
  }

  if (!pkg.types) {
    pkg.types = "dist/index.d.ts";
    changed = true;
  }

  if (!pkg.exports) {
    pkg.exports = {
      ".": {
        types: "./dist/index.d.ts",
        default: "./dist/index.js",
      },
    };
    changed = true;
  }

  const tsconfig = path.join(pkgDir, "tsconfig.build.json");
  if (!fs.existsSync(tsconfig)) {
    fs.writeFileSync(
      tsconfig,
      JSON.stringify(
        {
          extends: "../../tsconfig.json",
          compilerOptions: {
            outDir: "dist",
            declaration: true,
            declarationMap: true,
            emitDeclarationOnly: false,
            noEmitOnError: true,
          },
          include: ["src"],
        },
        null,
        2,
      ) + "\n",
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + "\n");
    console.log("🔧 auto-repaired", pkg.name);
    repaired = true;
  }
}

if (repaired) {
  run("pnpm install");
  run("pnpm -r --filter @bickford/* build");
} else {
  console.log("✅ no repairs needed");
}
