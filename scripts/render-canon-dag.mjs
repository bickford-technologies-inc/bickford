import fs from "node:fs";
import { execSync } from "node:child_process";

const drift = JSON.parse(fs.readFileSync("CANON/drift.json", "utf8"));

let dot = "digraph canon_drift {\nrankdir=LR;\n";

for (const node of drift.nodes) {
  dot += `"${node.id}" [label="${node.label}\\nΔ=${node.delta}"];
`;
}
for (const e of drift.edges) {
  dot += `"${e.from}" -> "${e.to}" [label="${e.reason}"];
`;
}

dot += "}\n";

fs.writeFileSync("/tmp/canon_drift.dot", dot);
execSync("dot -Tsvg /tmp/canon_drift.dot -o CANON/canon_drift.svg", {
  stdio: "inherit",
});

console.log("🧭 canon drift DAG → CANON/canon_drift.svg");
