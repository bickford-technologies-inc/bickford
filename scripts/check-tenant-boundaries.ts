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
  const ast = parse(fs.readFileSync(file, "utf8"), {
    sourceType: "module",
    plugins: ["typescript"],
  });

  traverse(ast, {
    FunctionDeclaration(path) {
      const name = path.node.id?.name;
      if (!name) return;

      if (name.match(/(get|list|create|update|delete)/i)) {
        const hasTenant = path.node.params.some(
          (p) => p.type === "Identifier" && p.name.match(/ctx|tenant/i)
        );

        if (!hasTenant) {
          console.error(`❌ [TENANT] ${file} → ${name} lacks TenantContext`);
          failed = true;
        }
      }
    },
  });
}

process.exit(failed ? 1 : 0);
