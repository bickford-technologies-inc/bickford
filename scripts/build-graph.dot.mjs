import fs from "fs";

const graph = JSON.parse(fs.readFileSync("build-graph.json", "utf8"));
let dot = "digraph BICKFORD {\n  rankdir=LR;\n";

for (const [pkg, deps] of Object.entries(graph)) {
  for (const dep of deps) {
    dot += `  \"${dep}\" -> \"${pkg}\";\n`;
  }
}

dot += "}\n";
fs.writeFileSync("build-graph.dot", dot);
console.log("📊 build-graph.dot generated");
