import fs from "fs";

const forbidden = ["package-lock.json", "yarn.lock"];
const found = forbidden.filter((f) => fs.existsSync(f));

if (found.length > 0) {
  console.error("❌ Forbidden lockfiles detected:");
  for (const f of found) console.error(` - ${f}`);
  console.error("This repository is pnpm-only.");
  process.exit(1);
}

if (!fs.existsSync("pnpm-lock.yaml")) {
  console.error("❌ pnpm-lock.yaml missing");
  process.exit(1);
}

console.log("✅ pnpm lockfile invariant satisfied");
