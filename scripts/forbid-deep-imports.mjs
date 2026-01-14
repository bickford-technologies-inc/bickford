import { execSync } from "node:child_process";

const forbidden = [
  "@bickford/core/src",
  "@bickford/ledger/src",
  "@bickford/db/src",
  "@bickford/types/src",
];

try {
  const matches = execSync(`rg "${forbidden.join("|")}"`, {
    stdio: "pipe",
  }).toString();

  if (matches.trim()) {
    console.error("❌ Forbidden deep imports detected:\n");
    console.error(matches);
    process.exit(1);
  }
} catch {
  console.log("✅ No forbidden deep imports found");
}
