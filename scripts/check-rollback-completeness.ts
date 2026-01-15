#!/usr/bin/env node

import fs from "fs";
import glob from "fast-glob";

const decisions = glob
  .sync("audit/ledger/*.json")
  .map((f) => JSON.parse(fs.readFileSync(f, "utf8")));

const failures = decisions.filter(
  (d) => ["DEPLOY", "MIGRATE", "DELETE"].includes(d.action) && !d.rollback
);

if (failures.length) {
  console.error("❌ Decisions missing rollback metadata:");
  failures.forEach((d) => console.error(" ", d.id));
  process.exit(1);
}
