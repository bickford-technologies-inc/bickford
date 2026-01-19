import fs from "fs";

const canon = fs.readFileSync("CANON/CANON.md", "utf8");

const rules = [
  ...canon.matchAll(/- id:\s*(\w+)[\s\S]*?confidence:\s*([0-9.]+)/g),
].map((m) => ({ id: m[1], confidence: parseFloat(m[2]) }));

const total = rules.reduce((a, r) => a + r.confidence, 0);
const score = Math.round((total / rules.length) * 100);

const output = { score, rules };
fs.writeFileSync(
  "artifacts/invariant-confidence.json",
  JSON.stringify(output, null, 2),
);

console.log(`🧠 Invariant Confidence Score: ${score}%`);

if (score < 85) {
  console.error("❌ Confidence below enforcement threshold");
  process.exit(1);
}
