#!/usr/bin/env ts-node

import fs from "fs";
import path from "path";
import yaml from "yaml";
import glob from "fast-glob";

const WORKSPACE_FILE = "pnpm-workspace.yaml";
const INTERNAL_SCOPE = "@bickford/";

function fail(msg) {
  console.error(`\n❌ [BICKFORD_WORKSPACE_BOUNDARY_VIOLATION]\n${msg}\n`);
  process.exit(1);
}

// Load workspace globs
if (!fs.existsSync(WORKSPACE_FILE)) {
  fail(`Missing ${WORKSPACE_FILE}`);
}

const workspace = yaml.parse(fs.readFileSync(WORKSPACE_FILE, "utf8"));
if (!Array.isArray(workspace?.packages)) {
  fail(`Invalid 'packages' field in ${WORKSPACE_FILE}`);
}

// Resolve all workspace package.json paths
const workspacePackageJsons = new Set(
  workspace.packages.flatMap((pattern) =>
    glob.sync(path.join(pattern, "package.json"))
  )
);

// Map workspace package.json → name
const workspacePackages = new Map();

for (const pkgPath of workspacePackageJsons) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (pkg?.name) {
    workspacePackages.set(pkgPath, pkg.name);
  }
}

// Scan all package.json files in repo
const allPackageJsons = glob.sync("**/package.json", {
  ignore: ["**/node_modules/**"],
});

for (const pkgPath of allPackageJsons) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const pkgName = pkg.name || pkgPath;

  const isWorkspacePackage = workspacePackageJsons.has(pkgPath);

  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  };

  for (const depName of Object.keys(deps || {})) {
    if (!depName.startsWith(INTERNAL_SCOPE)) continue;

    if (!isWorkspacePackage) {
      fail(
        `Package "${pkgName}" depends on internal package "${depName}",\n` +
        `but it is NOT a workspace package.\n\n` +
        `❌ @bickford/* dependencies are forbidden outside the workspace root.\n\n` +
        `Fix:\n` +
        `  - Move this package into pnpm-workspace.yaml\n` +
        `  - OR remove the @bickford/* dependency`
      );
    }
  }
}

console.log("✅ No @bickford/* dependencies exist outside the workspace root.");
