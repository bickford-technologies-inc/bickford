#!/usr/bin/env node

import fs from "fs";
import { execSync } from "child_process";

try {
  execSync("node scripts/check-schema-consistency.ts", { stdio: "inherit" });
} catch {
  if (!fs.existsSync("packages/db/schema/BREAKING.md")) {
    console.error("❌ Destructive schema change without BREAKING.md");
    process.exit(1);
  }
  console.warn("⚠️ Breaking schema change allowed by declaration");
}
