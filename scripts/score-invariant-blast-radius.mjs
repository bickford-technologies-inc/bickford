import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const invariants = JSON.parse(
  fs.readFileSync("CANON/canon.json", "utf8"),
).runtime;

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir)) {
    const p = path.join(dir, e);
    if (p.includes("node_modules") || p.includes("dist")) continue;
    if (fs.statSync(p).isDirectory()) walk(p, acc);
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) acc.push(p);
  }
  return acc;
}

const files = walk(ROOT);
const scores = {};

for (const key of Object.keys(invariants)) {
  let hits = 0;
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    if (src.includes(key.split("_")[0])) hits++;
  }
  scores[key] = hits;
}

fs.writeFileSync("CANON/blast-radius.json", JSON.stringify(scores, null, 2));

console.log("📊 Blast-radius scores updated");
