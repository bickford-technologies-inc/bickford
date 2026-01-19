import fs from "fs";
import path from "path";

const dir = "trace";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));

const nodes = files.map((f) =>
  JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")),
);

const dag = {
  generatedAt: Date.now(),
  nodes,
};

fs.writeFileSync("trace/dag.json", JSON.stringify(dag, null, 2));
console.log("🧬 DAG assembled");
