import { existsSync } from "fs";
import { resolve } from "path";

const pkgs = [
  "types",
  "optr",
  "authority",
  "core",
  "canon",
  "ledger",
  "session-completion",
  "ui",
  "web-ui",
  "claude-integration",
  "bickford-mobile-expo",
];

let failed = false;

for (const pkg of pkgs) {
  const dtsPath = resolve(`packages/${pkg}/dist/index.d.ts`);
  if (!existsSync(dtsPath)) {
    console.error(`❌ Missing dts for ${pkg}: ${dtsPath}`);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("✅ All dist/index.d.ts outputs verified for all packages");
