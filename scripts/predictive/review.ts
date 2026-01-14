import fs from "fs";

const LEDGER = ".bickford/build-failures.jsonl";

if (!fs.existsSync(LEDGER)) {
  console.log("ℹ️ No prior build failures recorded");
  process.exit(0);
}

const failures = fs
  .readFileSync(LEDGER, "utf8")
  .split("\n")
  .filter(Boolean)
  .map(JSON.parse);

const patterns = new Map<string, number>();

for (const f of failures) {
  const key = `${f.phase}:${f.errorClass}:${f.stackRoot}`;
  patterns.set(key, (patterns.get(key) ?? 0) + 1);
}

for (const [pattern, count] of patterns.entries()) {
  if (count >= 2) {
    console.log(`🔁 Known failure pattern detected: ${pattern}`);
  }
}

console.log("✅ Predictive Review complete");
