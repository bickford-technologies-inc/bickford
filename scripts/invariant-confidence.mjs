import fs from "fs";

const canon = JSON.parse(fs.readFileSync("CANON/canon.json", "utf8"));
const history = JSON.parse(
  fs.readFileSync("CANON/invariant-history.json", "utf8")
);

const scored = canon.invariants.map((inv) => {
  const events = history.filter((h) => h.invariant === inv.id);
  const failures = events.filter((e) => e.result === "fail").length;
  const total = Math.max(events.length, 1);

  return {
    id: inv.id,
    confidence: Math.round(((total - failures) / total) * 100),
  };
});

fs.writeFileSync(
  "CANON/invariant-confidence.json",
  JSON.stringify(scored, null, 2)
);

console.log("✅ invariant confidence updated");
