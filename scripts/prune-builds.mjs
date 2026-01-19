import fs from "fs";
import { execSync } from "child_process";

const ledger = JSON.parse(fs.readFileSync("promotions/ledger.json", "utf8"));
const changed = execSync("git diff --name-only origin/main", {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean);

const rebuild = new Set();

for (const f of changed) {
  const m = f.match(/packages\/([^/]+)/);
  if (!m) continue;

  const pkg = `@bickford/${m[1]}`;
  rebuild.add(pkg);

  if (ledger[pkg] !== "stable") continue;
}

console.log([...rebuild].join(" "));
