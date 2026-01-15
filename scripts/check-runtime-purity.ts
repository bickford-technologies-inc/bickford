#!/usr/bin/env node

import fs from "fs";
import glob from "fast-glob";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const ENTRYPOINT_RE = /(runtime|main|server|worker|cli)\.(ts|js)$/;

const files = glob.sync("**/*.{ts,tsx,js,jsx}", {
  ignore: ["**/node_modules/**", "**/dist/**"],
});

let failed = false;

for (const file of files) {
  if (ENTRYPOINT_RE.test(file)) continue;

  const ast = parse(fs.readFileSync(file, "utf8"), {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  traverse(ast, {
    CallExpression(path) {
      const callee = path.get("callee");

      if (
        path.parentPath.isProgram() || // top-level call
        path.parentPath.isVariableDeclarator()
      ) {
        const name = callee.isIdentifier() && callee.node.name;

        if (
          name &&
          [
            "createClient",
            "connect",
            "initialize",
            "config",
            "setup",
            "listen",
            "readFileSync",
          ].includes(name)
        ) {
          console.error(
            `❌ [RUNTIME_PURITY] ${file} has side effects at import time`
          );
          failed = true;
        }
      }
    },

    NewExpression(path) {
      if (path.parentPath.isProgram()) {
        console.error(
          `❌ [RUNTIME_PURITY] ${file} instantiates objects at top level`
        );
        failed = true;
      }
    },
  });
}

process.exit(failed ? 1 : 0);
