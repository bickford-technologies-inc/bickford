import fs from "node:fs";
import { execSync } from "node:child_process";

const symbols = JSON.parse(fs.readFileSync("CANON/symbols.json", "utf8"));

const deprecated = Object.entries(symbols)
  .filter(([, v]) => v.status === "deprecated")
  .map(([k]) => k);

if (deprecated.length === 0) {
  console.log("✅ no deprecated symbols");
  process.exit(0);
}

const matches = execSync(`rg "${deprecated.join("|")}" packages`, {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
});

if (!matches.trim()) {
  console.log("✅ no usage of deprecated symbols");
  process.exit(0);
}

console.log("⚠️ canon drift detected");
console.log(matches);
process.exit(42);
