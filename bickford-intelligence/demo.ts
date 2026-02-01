#!/usr/bin/env bun

import { CompoundingIntelligence } from "./packages/core/compounding-intelligence.js";

async function main() {
  console.log("\n");
  console.log(
    "╔══════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║                                                              ║",
  );
  console.log(
    "║        🧠 Bickford Compounding Intelligence Demo 🧠          ║",
  );
  console.log(
    "║                                                              ║",
  );
  console.log(
    "║  Demonstrating how AI decisions get faster and smarter      ║",
  );
  console.log(
    "║  with each execution through pattern learning.              ║",
  );
  console.log(
    "║                                                              ║",
  );
  console.log(
    "╚══════════════════════════════════════════════════════════════╝",
  );
  // Silent execution: all metrics and results are available via getMetrics()
  console.log("\n");
}

main().catch(console.error);
