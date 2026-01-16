#!/usr/bin/env tsx

import { readFileSync } from "fs";
import { globby } from "globby";

const FORBIDDEN = [
  "generateId(",
  "createIdGenerator(",
  "traceId",
  "executionId",
];

const TRACE_PATHS = [
  "packages/**/trace*.ts",
  "packages/**/DecisionTrace*.ts",
  "apps/**/trace*.ts",
];

let violations = 0;

const files = await globby(TRACE_PATHS);

for (const file of files) {
  const content = readFileSync(file, "utf8");

  for (const forbidden of FORBIDDEN) {
    if (content.includes(forbidden)) {
      console.error(`❌ RANDOM ID VIOLATION in ${file}`);
      console.error(`   Found forbidden token: ${forbidden}`);
      violations++;
    }
  }
}

if (violations > 0) {
  console.error(`\n🚫 ${violations} DecisionTrace ID violations found.`);
  process.exit(1);
}

console.log("✅ NO_RANDOM_TRACE_IDS guard passed");
