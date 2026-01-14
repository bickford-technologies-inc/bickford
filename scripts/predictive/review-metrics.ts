import fs from "fs";

const LEDGER = ".bickford/build-failures.jsonl";
const METRICS = ".bickford/metrics.json";

if (!fs.existsSync(LEDGER)) {
  fs.writeFileSync(
    METRICS,
    JSON.stringify(
      {
        totalFailures: 0,
        uniquePatterns: 0,
        guardedPatterns: 0,
        unguardedPatterns: 0,
        meanTimeToGuard: null,
      },
      null,
      2
    )
  );
  process.exit(0);
}

const failures = fs
  .readFileSync(LEDGER, "utf8")
  .split("\n")
  .filter(Boolean)
  .map(JSON.parse);
const patterns = new Map();
const guardSet = new Set();
let timeToGuardSum = 0;
let timeToGuardCount = 0;

for (const f of failures) {
  const key = `${f.phase}:${f.errorClass}:${f.stackRoot}`;
  patterns.set(key, (patterns.get(key) ?? 0) + 1);
  if (f.guarded) {
    guardSet.add(key);
    if (f.timeToGuard) {
      timeToGuardSum += f.timeToGuard;
      timeToGuardCount++;
    }
  }
}

const metrics = {
  totalFailures: failures.length,
  uniquePatterns: patterns.size,
  guardedPatterns: guardSet.size,
  unguardedPatterns: patterns.size - guardSet.size,
  meanTimeToGuard: timeToGuardCount
    ? (timeToGuardSum / timeToGuardCount).toFixed(2) + " days"
    : null,
};

fs.writeFileSync(METRICS, JSON.stringify(metrics, null, 2));
console.log("✅ Predictive Metrics Dashboard updated");
