#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const PKG_DIR = path.join(ROOT, "packages");

function countDependents(pkgName) {
  let count = 0;
  for (const dir of fs.readdirSync(PKG_DIR)) {
    const pkgPath = path.join(PKG_DIR, dir, "package.json");
    if (!fs.existsSync(pkgPath)) continue;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const deps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
      ...pkg.peerDependencies,
    };
    if (deps?.[`@bickford/${pkgName}`]) count++;
  }
  return count;
}

const violations = JSON.parse(
  fs.readFileSync("canon/invariant-violations.json", "utf8"),
);

const scored = violations.map((v) => {
  const dependents = countDependents(v.package);
  const score = Math.min(100, dependents * 20);
  return { ...v, blastRadius: score };
});

fs.writeFileSync(
  "canon/blast-radius.json",
  JSON.stringify(scored, null, 2) + "\n",
);

console.log("✅ Blast-radius scoring complete");
