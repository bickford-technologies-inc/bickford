#!/usr/bin/env node

import { execSync } from "child_process";

try {
  execSync("db-migrate up --dry-run", { stdio: "inherit" });
} catch {
  console.error("❌ Schema does not match migrations");
  process.exit(1);
}
