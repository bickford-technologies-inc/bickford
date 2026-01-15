#!/usr/bin/env node

import fs from "fs";
import glob from "fast-glob";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const files = glob.sync("**/*.{ts,tsx}", {
  ignore: ["**/node_modules/**", "**/dist/**"],
});

let failed = false;

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");

  const ast = parse(src, {
    sourceType: "module",
    plugins: ["typescript"],
  });

  traverse(ast, {
    FunctionDeclaration(path) {
      const name = path.node.id?.name;
      if (!name) return;

      const hasCtx = path.node.params.some(
        (p) => p.type === "Identifier" && p.name === "ctx"
      );

      if (name.match(/(create|update|delete|write|execute)/i) && !hasCtx) {
        console.error(`❌ [AUTH] ${file} → ${name} lacks AuthContext`);
        failed = true;
      }
    },
  });
}

process.exit(failed ? 1 : 0);
