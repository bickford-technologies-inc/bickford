import fs from "fs";

const THRESHOLD = 3;
const LOG = "logs/pattern-detections.json";
const CANON = "CANON/BUILD_INVARIANTS.md";

if (!fs.existsSync(LOG)) process.exit(0);

const detections = JSON.parse(fs.readFileSync(LOG, "utf8"));
const counts = {};

for (const d of detections) {
  counts[d.pattern] = (counts[d.pattern] || 0) + 1;
}

for (const [pattern, count] of Object.entries(counts)) {
  if (count >= THRESHOLD) {
    const entry = `\n## AUTO-PROMOTED INVARIANT\n- Pattern: ${pattern}\n- Trigger Count: ${count}\n- Status: ENFORCED\n`;
    fs.appendFileSync(CANON, entry);
    console.log(`📜 invariant promoted: ${pattern}`);
  }
}
