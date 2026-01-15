#!/usr/bin/env node

import fs from "fs";
import path from "path";
import ts from "typescript";

function extractAPI(entry) {
  const program = ts.createProgram([entry], {
    declaration: true,
    emitDeclarationOnly: true,
  });

  const checker = program.getTypeChecker();
  const source = program.getSourceFile(entry);

  const api = {};

  ts.forEachChild(source, (node) => {
    if (
      ts.canHaveModifiers(node) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    ) {
      const symbol = checker.getSymbolAtLocation(node.name);
      if (!symbol) return;
      api[symbol.getName()] = checker.typeToString(
        checker.getTypeOfSymbolAtLocation(symbol, node)
      );
    }
  });

  return api;
}

const pkg = process.argv[2];
if (!pkg) throw new Error("package required");

const entry = path.join("packages", pkg, "src", "index.ts");
const out = path.join("packages", pkg, "api", "public.api.json");

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(extractAPI(entry), null, 2) + "\n");

console.log(`✅ API snapshot written: ${out}`);
