#!/usr/bin/env node

import { execSync } from "child_process";

const diff = execSync("git diff --cached --name-status", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const illegal = diff.filter((line) => {
  const [status, file] = line.split(/\s+/);
  return file?.includes("migrations/") && status !== "A";
});

if (illegal.length) {
  console.error("❌ Migration files are immutable:");
  illegal.forEach((l) => console.error(" ", l));
  process.exit(1);
}
