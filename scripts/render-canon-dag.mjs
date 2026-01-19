import fs from "fs";

const canon = JSON.parse(fs.readFileSync("CANON/canon.json", "utf8"));

const nodes = canon.invariants.map((i) => ({
  id: i.id,
  label: i.id,
}));

const edges = canon.invariants.flatMap((i) =>
  (i.depends_on || []).map((d) => ({
    from: d,
    to: i.id,
  })),
);

fs.writeFileSync(
  "public/canon-dag.json",
  JSON.stringify({ nodes, edges }, null, 2),
);

console.log("✅ canon DAG generated");

fs.writeFileSync("/tmp/canon_drift.dot", dot);
execSync("dot -Tsvg /tmp/canon_drift.dot -o CANON/canon_drift.svg", {
  stdio: "inherit",
});

console.log("🧭 canon drift DAG → CANON/canon_drift.svg");
