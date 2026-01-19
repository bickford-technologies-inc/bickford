import fs from "fs";

const history = JSON.parse(
  fs.readFileSync("CANON/history.json", "utf8")
);

const rows = history.map(h => ({
  timestamp: h.timestamp,
  invariant_count: h.invariants.length
}));

fs.writeFileSync(
  "CANON/drift.csv",
  "timestamp,invariants\n" +
    rows.map(r => `${r.timestamp},${r.invariant_count}`).join("\n")
);

console.log("📈 Canon drift updated");
