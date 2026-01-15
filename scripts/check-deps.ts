#!/usr/bin/env ts-node

import fs from "fs";
import path from "path";
import { builtinModules } from "module";
import glob from "fast-glob";

const ROOT = process.cwd();

// packages/apps you want checked
const WORKSPACES = ["apps/*", "packages/*"];

const JS_TS_GLOB = "**/*.{ts,tsx,js,jsx}";
const IMPORT_RE =
  /(?:import\s+.*?from\s+['"]([^'"]+)['"]|require\(['"]([^'"]+)['"]\))/g;

function readJSON(file: string) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function isExternalImport(spec: string) {
  return (
    !spec.startsWith(".") &&
    !spec.startsWith("/") &&
    !builtinModules.includes(spec)
  );
}

function packageNameFromImport(spec: string) {
  // @scope/pkg/subpath → @scope/pkg
  // pkg/subpath → pkg
  if (spec.startsWith("@")) {
    const [scope, name] = spec.split("/");
    return `${scope}/${name}`;
  }
  return spec.split("/")[0];
}

let hasErrors = false;

for (const workspacePattern of WORKSPACES) {
  const workspaces = glob.sync(workspacePattern, {
    onlyDirectories: true,
    cwd: ROOT,
  });

  for (const ws of workspaces) {
    const pkgJsonPath = path.join(ROOT, ws, "package.json");
    if (!fs.existsSync(pkgJsonPath)) continue;

    const pkg = readJSON(pkgJsonPath);
    const declaredDeps = new Set([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.devDependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ]);

    const files = glob.sync(JS_TS_GLOB, {
      cwd: path.join(ROOT, ws),
      absolute: true,
      ignore: ["**/node_modules/**", "**/dist/**"],
    });

    for (const file of files) {
      const content = fs.readFileSync(file, "utf8");
      let match;
      while ((match = IMPORT_RE.exec(content))) {
        const spec = match[1] || match[2];
        if (!spec || !isExternalImport(spec)) continue;

        const pkgName = packageNameFromImport(spec);
        if (!declaredDeps.has(pkgName)) {
          console.error(
            `❌ [DEP_INVARIANT] ${ws}\n` +
              `   ${path.relative(ROOT, file)} imports "${pkgName}"\n` +
              `   but it is not declared in ${ws}/package.json`
          );
          hasErrors = true;
        }
      }
    }
  }
}

if (hasErrors) {
  process.exit(1);
} else {
  console.log("✅ dependency invariant satisfied");
}
