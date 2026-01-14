import fs from "node:fs";
import path from "node:path";

// Source-First invariant: No package should require dist/index.js for web builds.
// This script fails if any CI or build step REQUIRES dist/index.js for @bickford/* packages.

const forbidden = [
  "scripts/check-dist-exports.mjs",
  // Add other dist-enforcing scripts here if reintroduced
];

let violated = false;
for (const file of forbidden) {
  if (fs.existsSync(file)) {
    console.error(
      `❌ Source-First invariant violated: ${file} enforces dist output. Remove this for source-first mode.`
    );
    violated = true;
  }
}

if (violated) {
  process.exit(1);
}

console.log(
  "✅ Source-First invariant satisfied: No dist enforcement present."
);
