#!/usr/bin/env node

import glob from "fast-glob";
import fs from "fs";

const files = glob.sync("**/*.{ts,tsx,js,jsx}", {
  ignore: ["**/node_modules/**", "**/dist/**"],
});

const bad = [];

for (const f of files) {
  const c = fs.readFileSync(f, "utf8");

  if (
    /process\.env\./.test(c) &&
    !/(runtime|main|server|worker|cli)\.(ts|js)/.test(f)
  ) {
    bad.push(f);
  }
}

if (bad.length) {
  console.error("❌ Runtime-only APIs used outside entrypoints:");
  bad.forEach((f) => console.error(" ", f));
  process.exit(1);
}
