import { execSync } from "node:child_process";

const checks = [
  "pnpm --filter @bickford/types build",
  "pnpm --filter @bickford/ledger build",
  "pnpm --filter @bickford/execution-convergence build",
  "pnpm --filter @bickford/web-ui build",
];

for (const cmd of checks) {
  execSync(cmd, { stdio: "inherit" });
}

console.log("✓ PREFLIGHT PASSED");
