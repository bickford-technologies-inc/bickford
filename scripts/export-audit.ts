#!/usr/bin/env node

import fs from "fs";
import glob from "fast-glob";

const records = glob
  .sync("audit/ledger/*.json")
  .map((f) => JSON.parse(fs.readFileSync(f, "utf8")));

fs.writeFileSync(
  "audit/exports/decision-trace.json",
  JSON.stringify(records, null, 2)
);

console.log("✅ audit export written");
