// scripts/complete-build.ts
// Bun-based build and evidence capture (optional, for Bun users)

import { $ } from "bun";

async function main() {
  console.log("\n=== Bickford Complete Build & Evidence Capture (Bun) ===\n");

  // Validate
  await $`./scripts/validate-bash.sh`;

  // Run all demos
  await $`bun run bickford-intelligence/packages/demo/claude-comparison.ts > demo-outputs/claude-comparison.txt`;
  await $`bun run bickford-intelligence/packages/demo/compliance-demo.ts > demo-outputs/compliance-demo.txt`;
  await $`bun run bickford-intelligence/packages/demo/regulator-demo.ts > demo-outputs/regulator-demo.txt`;

  // Generate evidence (simulate)
  await $`ls -la demo-outputs/ > artifacts/build-evidence.json`;

  console.log("\nBuild complete. Outputs in demo-outputs/ and artifacts/\n");
}

main();
