#!/usr/bin/env ts-node

import fs from "fs";
import glob from "fast-glob";

const ROOT_PACKAGE = "package.json";

const PNPM_ALLOWED_FIELDS = new Set([
  "name",
  "version",
  "private",
  "description",
  "keywords",
  "homepage",
  "repository",
  "bugs",
  "license",
  "author",

  "type",
  "bin",
  "exports",
  "main",
  "module",
  "types",
  "files",

  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
  "peerDependenciesMeta",

  "scripts",
  "engines",
  "os",
  "cpu",

  "pnpm",
  "workspaces",
]);

const ROOT_ONLY_FIELDS = new Set([
  "workspaces",
  "packageManager",
  "overrides",
  "resolutions",
]);

function fail(msg) {
  console.error(`\n❌ [PACKAGEJSON_SCHEMA_VIOLATION]\n${msg}\n`);
  process.exit(1);
}

const allPackageJsons = glob.sync("**/package.json", {
  ignore: ["**/node_modules/**"],
});

for (const pkgPath of allPackageJsons) {
  const isRoot = pkgPath === ROOT_PACKAGE;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

  for (const field of Object.keys(pkg)) {
    if (!PNPM_ALLOWED_FIELDS.has(field)) {
      fail(
        `Illegal field "${field}" found in ${pkgPath}\n\n` +
        `❌ This field is not allowed by the package.json schema lock.\n` +
        `Fix: move this config to a dedicated config file.`
      );
    }

    if (!isRoot && ROOT_ONLY_FIELDS.has(field)) {
      fail(
        `Root-only field "${field}" found in non-root package:\n\n` +
        `  ${pkgPath}\n\n` +
        `❌ This field is only allowed in the workspace root.`
      );
    }
  }
}

console.log("✅ package.json schema lock enforced.");
