#!/usr/bin/env ts-node

import fs from "fs";
import path from "path";
import yaml from "yaml";
import glob from "fast-glob";

const WORKSPACE_FILE = "pnpm-workspace.yaml";

function fail(msg) {
  console.error(`\n❌ [WORKSPACE_PACKAGEJSON_BOUNDARY_VIOLATION]\n${msg}\n`);
  process.exit(1);
}

if (!fs.existsSync(WORKSPACE_FILE)) {
  fail(`Missing ${WORKSPACE_FILE}`);
}

const workspace = yaml.parse(fs.readFileSync(WORKSPACE_FILE, "utf8"));
if (!Array.isArray(workspace?.packages)) {
  fail(`Invalid 'packages' field in ${WORKSPACE_FILE}`);
}

// Resolve all allowed workspace package.json paths
const allowedPackageJsons = new Set(
  workspace.packages.flatMap((pattern) =>
    glob.sync(path.join(pattern, "package.json"))
  )
);

// Find all package.json files in repo
const allPackageJsons = glob.sync("**/package.json", {
  ignore: ["**/node_modules/**"],
});

for (const pkgPath of allPackageJsons) {
  if (!allowedPackageJsons.has(pkgPath)) {
    fail(
      `Illegal package.json detected:\n\n` +
        `  ${pkgPath}\n\n` +
        `❌ This package.json is not covered by pnpm-workspace.yaml.\n\n` +
        `Fix:\n` +
        `  - Add its directory to pnpm-workspace.yaml\n` +
        `  - OR remove the package.json`
    );
  }
}

console.log("✅ All package.json files are within workspace boundaries.");
