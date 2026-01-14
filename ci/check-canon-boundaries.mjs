#!/usr/bin/env node
/**
 * Canon Authority Boundary Guard
 * Enforces workspace dependency and TS project reference invariants.
 * Fails CI if any package imports another workspace package without:
 *   - explicit package.json dependency
 *   - tsconfig project reference (if composite)
 *
 * Usage: node ci/check-canon-boundaries.mjs
 */

import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import fs from "fs";
import path from "path";
import ts from "typescript";

const workspaceRoot = path.resolve(__dirname, "..");
const packagesDir = path.join(workspaceRoot, "packages");

function getPackages() {
  return fs.readdirSync(packagesDir).filter((pkg) => {
    return fs.existsSync(path.join(packagesDir, pkg, "package.json"));
  });
}

function getPackageJson(pkg) {
  return JSON.parse(
    fs.readFileSync(path.join(packagesDir, pkg, "package.json"), "utf8")
  );
}

function getTsConfig(pkg) {
  const tsconfigPath = path.join(packagesDir, pkg, "tsconfig.json");
  if (!fs.existsSync(tsconfigPath)) return null;
  return JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
}

function getWorkspaceImports(pkg) {
  const srcDir = path.join(packagesDir, pkg, "src");
  if (!fs.existsSync(srcDir)) return [];
  const files = [];
  function walk(dir) {
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) walk(full);
      else if (full.endsWith(".ts") || full.endsWith(".tsx")) files.push(full);
    }
  }
  walk(srcDir);
  const imports = new Set();
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    const matches = source.match(/from ['"](@bickford\/[a-zA-Z0-9_-]+)['"]/g);
    if (matches) {
      for (const m of matches) {
        const pkgName = m.match(/@bickford\/[a-zA-Z0-9_-]+/)[0];
        if (pkgName && pkgName !== `@bickford/${pkg}`) imports.add(pkgName);
      }
    }
  }
  return Array.from(imports);
}

function checkBoundary(pkg) {
  const pkgJson = getPackageJson(pkg);
  const tsconfig = getTsConfig(pkg);
  const imports = getWorkspaceImports(pkg);
  const deps = Object.assign({}, pkgJson.dependencies, pkgJson.devDependencies);
  const refs =
    tsconfig && tsconfig.references
      ? tsconfig.references.map((r) => r.path)
      : [];
  let ok = true;
  for (const imp of imports) {
    const impShort = imp.replace("@bickford/", "");
    // Check package.json dependency
    if (!deps[imp]) {
      console.error(
        `❌ Canon boundary violation: ${pkg} imports ${imp} → missing package.json dependency`
      );
      ok = false;
    }
    // Check tsconfig reference (if composite)
    if (
      tsconfig &&
      tsconfig.compilerOptions &&
      tsconfig.compilerOptions.composite
    ) {
      if (!refs.includes(`../${impShort}`)) {
        console.error(
          `❌ Canon boundary violation: ${pkg} imports ${imp} → missing tsconfig project reference to ../${impShort}`
        );
        ok = false;
      }
    }
  }
  return ok;
}

function main() {
  let allOk = true;
  for (const pkg of getPackages()) {
    if (!checkBoundary(pkg)) allOk = false;
  }
  if (!allOk) {
    process.exit(1);
  } else {
    console.log("✅ Canon authority boundaries enforced.");
  }
}

main();
