import fs from "fs";

if (!fs.existsSync("pnpm-lock.yaml")) {
  console.error("❌ pnpm-lock.yaml missing at build root");
  process.exit(1);
}

console.log("✅ pnpm-lock.yaml present");
