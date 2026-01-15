#!/usr/bin/env node

import fs from "fs";
import glob from "fast-glob";

const decisions = glob
  .sync("audit/ledger/*.json")
  .map((f) => JSON.parse(fs.readFileSync(f, "utf8")));

const rollbacks = decisions.filter((d) => d.rollback);

fs.writeFileSync(
  "audit/exports/rollback-proof.json",
  JSON.stringify(rollbacks, null, 2)
);

console.log("✅ rollback proof exported");
