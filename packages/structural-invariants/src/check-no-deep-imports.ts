#!/usr/bin/env node
import glob from "fast-glob";
import fs from "fs";

export async function runCheckNoDeepImports() {
  const files = glob.sync("**/*.{ts,tsx,js,jsx}", {
    ignore: ["**/node_modules/**", "**/dist/**"],
  });

  const bad = [];

  for (const f of files) {
    const c = fs.readFileSync(f, "utf8");
    if (/@bickford\/[^'\"]+\/(src|dist)\//.test(c)) bad.push(f);
  }

  if (bad.length) {
    console.error("❌ Deep imports detected:");
    bad.forEach((f) => console.error("  ", f));
    process.exit(1);
  }
}
