#!/usr/bin/env node
/**
 * Turbo Graph Validator (Canonical)
 * Ensures Turbo's execution graph matches TS project references.
 * Fails CI if any TS reference is missing in workspace dependencies or if turbo.json lacks '^build'.
 *
 * Usage: node ci/check-turbo-graph.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "..");
const packagesDir = path.join(workspaceRoot, "packages");
const turboConfigPath = path.join(workspaceRoot, "turbo.json");

function getPackages() {
  return fs.readdirSync(packagesDir).filter((pkg) => {
    return fs.existsSync(path.join(packagesDir, pkg, "package.json"));
  });
}

function getTsConfig(pkg) {
  const tsconfigPath = path.join(packagesDir, pkg, "tsconfig.json");
  if (!fs.existsSync(tsconfigPath)) return null;
  return JSON.parse(fs.readFileSync(tsconfigPath, "utf8"));
}

function getPackageJson(pkg) {
  return JSON.parse(
    fs.readFileSync(path.join(packagesDir, pkg, "package.json"), "utf8")
  );
}

function turboHasBuildDependsOn() {
  if (!fs.existsSync(turboConfigPath)) return false;
  const turbo = JSON.parse(fs.readFileSync(turboConfigPath, "utf8"));
  const pipeline = turbo.pipeline || {};
  const build = pipeline.build || {};
  const deps = build.dependsOn || [];
  return deps.includes("^build");
}

function checkTurboGraph(pkg) {
  const tsconfig = getTsConfig(pkg);
  const pkgJson = getPackageJson(pkg);
  const refs =
    tsconfig && tsconfig.references
      ? tsconfig.references.map((r) => r.path.replace("../", "@bickford/"))
      : [];
  const deps = Object.assign({}, pkgJson.dependencies, pkgJson.devDependencies);
  let ok = true;
  for (const ref of refs) {
    if (!deps[ref]) {
      console.error(
        `❌ Turbo graph violation: ${pkg} references ${ref} in TS but not in package.json dependencies`
      );
      ok = false;
    }
  }
  return ok;
}

function main() {
  let allOk = true;
  if (!turboHasBuildDependsOn()) {
    console.error(
      "❌ Turbo graph violation: turbo.json pipeline.build.dependsOn must include '^build' for correct execution order."
    );
    allOk = false;
  }
  for (const pkg of getPackages()) {
    if (!checkTurboGraph(pkg)) allOk = false;
  }
  if (!allOk) {
    process.exit(1);
  } else {
    console.log(
      "✅ Turbo graph matches TS project references and workspace dependencies."
    );
  }
}

main();
