import fs from "fs";

const rows = fs
  .readFileSync("metrics/ttg.csv", "utf8")
  .trim()
  .split("\n")
  .slice(-5)
  .map(r => Number(r.split(",")[1]));

const avg = rows.reduce((a, b) => a + b, 0) / rows.length;

if (avg > 120000) {
  console.error("🚨 TTG SLO VIOLATION:", avg);
  process.exit(1);
}

console.log("✅ TTG within SLO:", avg);
