import fs from "fs";
import path from "path";

const root = process.cwd();
const seen = new Map();

function main() {
  function walk(dir) {
    for (const entry of fs.readdirSync(dir)) {
      if (entry === "node_modules") continue;
      const p = path.join(dir, entry);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        walk(p);
        continue;
      }
      if (entry === "package.json") {
        check(p);
      }
    }
  }
  function check(pkgPath) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    if (!pkg.name) return;
    if (seen.has(pkg.name)) {
      const msg = "[CANON_VIOLATION] Duplicate workspace name: " + pkg.name + "\nA: " + seen.get(pkg.name) + "\nB: " + pkgPath;
      throw new Error(msg);
    }
    seen.set(pkg.name, pkgPath);
  }
  walk(root);
}

main();
console.log("✔ bickford-preflight passed");
