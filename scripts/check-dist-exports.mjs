import fs from "node:fs";
import path from "node:path";

const pkgs = fs.readdirSync("packages");
let failed = false;

for (const pkg of pkgs) {
  const entry = path.join("packages", pkg, "dist", "index.js");
  if (!fs.existsSync(entry)) {
    console.error(`❌ ${pkg} missing dist/index.js`);
    failed = true;
  }
}

if (failed) {
  console.error("\n⛔ Build blocked: all packages must emit dist.");
  process.exit(1);
}

console.log("✅ All package dist entrypoints present");
