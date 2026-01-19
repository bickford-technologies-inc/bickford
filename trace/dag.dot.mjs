import fs from "fs";

const dag = JSON.parse(fs.readFileSync("trace/dag.json", "utf8"));

let dot = "digraph Execution {\n";

for (const n of dag.nodes) {
  dot += `  \"${n.id}\" [label=\"${n.agent}\\n${n.action}\"];\n`;
}

for (let i = 1; i < dag.nodes.length; i++) {
  dot += `  \"${dag.nodes[i - 1].id}\" -> \"${dag.nodes[i].id}\";\n`;
}

dot += "}\n";

fs.writeFileSync("trace/dag.dot", dot);
console.log("🧬 DOT graph written");
