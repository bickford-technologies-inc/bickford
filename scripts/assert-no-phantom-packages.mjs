import fs from "fs";
import path from "path";

const FORBIDDEN = ["@bickford/canon"];
const ROOT = process.cwd();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    if (entry.name === "package.json") check(p);
  }
}

function check(pkgPath) {
  const json = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  for (const field of [
    "dependencies",
    "devDependencies",
    "peerDependencies",
    "optionalDependencies",
  ]) {
    for (const dep of FORBIDDEN) {
      if (json[field]?.[dep]) {
        console.error(`❌ Phantom dependency detected: ${dep} in ${pkgPath}`);
        process.exit(1);
      }
    }
  }
}

walk(ROOT);
console.log("✅ No phantom packages detected");
