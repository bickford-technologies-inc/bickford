#!/usr/bin/env node

import fs from "fs";
import glob from "fast-glob";

const files = glob.sync("**/*.{ts,tsx}", {
  ignore: ["**/node_modules/**", "**/dist/**"],
});

let failed = false;

for (const f of files) {
  const c = fs.readFileSync(f, "utf8");

  if (
    /(authorize|migrate|deploy|delete|update)/.test(c) &&
    !c.includes("writeAudit")
  ) {
    console.error(`❌ [AUDIT] ${f} performs critical action without audit`);
    failed = true;
  }
}

process.exit(failed ? 1 : 0);
