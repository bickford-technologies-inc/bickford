// scripts/validate-build.ts
// Bun-based validation script (optional, for Bun users)

import { $ } from "bun";

async function main() {
  console.log("\n=== Bickford Validation (Bun) ===\n");

  // Check for core files
  const files = [
    "bickford-intelligence/packages/core/claude-enforcer.ts",
    "bickford-intelligence/packages/demo/claude-comparison.ts",
    "bickford-intelligence/packages/demo/compliance-demo.ts",
    "bickford-intelligence/packages/demo/regulator-demo.ts",
    "package.json",
  ];

  let pass = 0,
    fail = 0;
  for (const file of files) {
    try {
      await $`test -f ${file}`;
      console.log(`✅ ${file}`);
      pass++;
    } catch {
      console.log(`❌ ${file}`);
      fail++;
    }
  }

  if (fail === 0) {
    console.log("\nAll core files present. Ready to build.\n");
    process.exit(0);
  } else {
    console.log("\nSome files missing. See above.\n");
    process.exit(1);
  }
}

main();
