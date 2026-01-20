#!/usr/bin/env ts-node
import fs from "fs";
import path from "path";
import glob from "fast-glob";
import { builtinModules } from "module";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

export async function runCheckDeps() {
  const ROOT = process.cwd();
  const WORKSPACES = ["apps/*", "packages/*"];
  const AUTO_FIX = process.argv.includes("--autofix");
  const INTERNAL_SCOPE = "@bickford/";

  function readJSON(p: string) {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  }

  function writeJSON(p: string, obj: any) {
    fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
  }

  function isExternal(spec: string) {
    return (
      !spec.startsWith(".") &&
      !spec.startsWith("/") &&
      !builtinModules.includes(spec)
    );
  }

  function pkgFromImport(spec: string) {
    return spec.startsWith("@")
      ? spec.split("/").slice(0, 2).join("/")
      : spec.split("/")[0];
  }

  const versionMap = new Map<string, string>();
  for (const wsPattern of WORKSPACES) {
    const dirs = glob.sync(wsPattern, { onlyDirectories: true });
    for (const dir of dirs) {
      const pkgPath = path.join(dir, "package.json");
      if (!fs.existsSync(pkgPath)) continue;
      const pkg = readJSON(pkgPath);
      if (pkg.name && pkg.version) {
        versionMap.set(pkg.name, pkg.version);
      }
    }
  }

  let failed = false;

  for (const wsPattern of WORKSPACES) {
    const dirs = glob.sync(wsPattern, { onlyDirectories: true });

    for (const dir of dirs) {
      const pkgPath = path.join(dir, "package.json");
      if (!fs.existsSync(pkgPath)) continue;

      const pkg = readJSON(pkgPath);
      const declared = new Set([
        ...Object.keys(pkg.dependencies || {}),
        ...Object.keys(pkg.devDependencies || {}),
        ...Object.keys(pkg.peerDependencies || {}),
      ]);

      const imports = new Set<string>();

      const files = glob.sync("**/*.{ts,tsx,js,jsx}", {
        cwd: dir,
        absolute: true,
        ignore: ["**/node_modules/**", "**/dist/**"],
      });

      for (const file of files) {
        const ast = parse(fs.readFileSync(file, "utf8"), {
          sourceType: "module",
          plugins: ["typescript", "jsx"],
        });

        traverse(ast, {
          ImportDeclaration({ node }) {
            imports.add(node.source.value);
          },
          CallExpression({ node }) {
            if (
              node.callee.type === "Identifier" &&
              node.callee.name === "require" &&
              node.arguments[0]?.type === "StringLiteral"
            ) {
              imports.add(node.arguments[0].value);
            }
          },
        });
      }

      for (const spec of imports) {
        if (!isExternal(spec)) continue;
        const dep = pkgFromImport(spec);
        if (!declared.has(dep)) {
          if (AUTO_FIX) {
            pkg.dependencies ||= {};
            const resolvedVersion =
              dep.startsWith(INTERNAL_SCOPE) && versionMap.get(dep)
                ? versionMap.get(dep)
                : "*";
            pkg.dependencies[dep] = resolvedVersion;
            console.log(`🔧 autofix: ${dir} → ${dep}`);
          } else {
            console.error(
              `❌ [DEP_INVARIANT] ${dir} imports "${dep}" but does not declare it`
            );
            failed = true;
          }
        }
      }

      if (AUTO_FIX) writeJSON(pkgPath, pkg);
    }
  }

  if (failed) process.exit(1);
}
