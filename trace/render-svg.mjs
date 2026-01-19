import { execSync } from "child_process";

execSync("dot -Tsvg trace/dag.dot -o trace/dag.svg", { stdio: "inherit" });

console.log("🧬 DAG rendered → trace/dag.svg");
