#!/usr/bin/env node

import fs from "fs";
import path from "path";
import glob from "glob";

const ROOT = process.cwd();
const PKG_DIRS = ["packages", "apps"];

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function getAllPackages() {
  const results = [];
  for (const base of PKG_DIRS) {
    const abs = path.join(ROOT, base);
    if (!fs.existsSync(abs)) continue;

    for (const dir of fs.readdirSync(abs)) {
      const pkgPath = path.join(abs, dir, "package.json");
      if (!fs.existsSync(pkgPath)) continue;

      const pkg = readJSON(pkgPath);
      if (!pkg.name) continue;

      results.push({ name: pkg.name, dir: path.join(abs, dir), pkg });
    }
  }
  return results;
}

function scanImports(dir) {
  const imports = new Set();
  const files = glob.sync("**/*.{ts,tsx}", {
    cwd: dir,
    ignore: ["node_modules/**", "dist/**", ".turbo/**"],
  });

  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), "utf8");
    const matches = content.matchAll(/from\s+['"](@bickford\/[^'"]+)['"]/g);
    for (const m of matches) imports.add(m[1]);
  }
  return imports;
}

let failed = false;

for (const { name, dir, pkg } of getAllPackages()) {
  const imports = scanImports(dir);
  const declared = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  for (const imp of imports) {
    if (!declared?.[imp]) {
      console.error(
        `❌ ${name} imports "${imp}" but does not declare it as a dependency`
      );
      failed = true;
    }
  }
}

if (failed) {
  console.error("\nWorkspace dependency invariant violated.\n");
  process.exit(1);
}

console.log("✅ Workspace dependency invariant satisfied.");
