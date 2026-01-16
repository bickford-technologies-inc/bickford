#!/usr/bin/env ts-node

import fs from "fs";
import path from "path";
import yaml from "yaml";
import glob from "fast-glob";

const WORKSPACE_FILE = "pnpm-workspace.yaml";
const INTERNAL_SCOPE = "@bickford/";

function fail(msg: string): never {
  console.error(`\n❌ [BICKFORD_WORKSPACE_DEP_VIOLATION]\n${msg}\n`);
  process.exit(1);
}

if (!fs.existsSync(WORKSPACE_FILE)) {
  fail(`Missing ${WORKSPACE_FILE}`);
}

const workspace = yaml.parse(fs.readFileSync(WORKSPACE_FILE, "utf8"));
if (!Array.isArray(workspace?.packages)) {
  fail(`Invalid 'packages' field in ${WORKSPACE_FILE}`);
}

/**
 * Resolve all workspace package.json files
 */
const workspacePackageJsons = workspace.packages.flatMap((pattern: string) =>
  glob.sync(path.join(pattern, "package.json"))
);

const workspacePackages = new Map<string, string>();

for (const pkgPath of workspacePackageJsons) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  if (pkg?.name) {
    workspacePackages.set(pkg.name, pkgPath);
  }
}

if (workspacePackages.size === 0) {
  fail("No workspace packages discovered.");
}

/**
 * Scan all package.json files in repo
 */
const allPackageJsons = glob.sync("**/package.json", {
  ignore: ["**/node_modules/**"],
});

for (const pkgPath of allPackageJsons) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  };

  for (const depName of Object.keys(deps || {})) {
    if (!depName.startsWith(INTERNAL_SCOPE)) continue;

    if (!workspacePackages.has(depName)) {
      fail(
        `Package "${pkg.name}" depends on "${depName}",\n` +
        `but no workspace package with that name exists.\n\n` +
        `Expected one of:\n` +
        `${Array.from(workspacePackages.keys())
          .map((n) => `  - ${n}`)
          .join("\n")}\n\n` +
        `Fix: create the workspace package or remove the dependency.`
      );
    }
  }
}

console.log("✅ All @bickford/* dependencies resolve to workspace packages.");
