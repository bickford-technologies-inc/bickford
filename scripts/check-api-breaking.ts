#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const pkg = process.argv[2];
const breakingDoc = path.join("packages", pkg, "api", "BREAKING.md");

try {
  execSync(`node scripts/check-api.ts ${pkg}`, {
    stdio: "inherit",
  });
} catch {
  if (!fs.existsSync(breakingDoc)) {
    console.error(`❌ Breaking API change without ${breakingDoc}`);
    process.exit(1);
  }

  console.warn("⚠️ Breaking change allowed due to BREAKING.md");
}
