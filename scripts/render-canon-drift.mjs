import fs from "node:fs";

const symbols = JSON.parse(fs.readFileSync("CANON/symbols.json", "utf8"));

let dot = `digraph Canon {\n  rankdir=LR;\n`;

for (const [sym, meta] of Object.entries(symbols)) {
  dot += `  \"${sym}\" [label=\"${sym}\\n${meta.status}\"];\n`;
  if (meta.replacedBy) {
    dot += `  \"${sym}\" -> \"${meta.replacedBy}\" [label=\"migrates to\"];\n`;
  }
}

dot += "}\n";

fs.writeFileSync("canon-drift.dot", dot);
