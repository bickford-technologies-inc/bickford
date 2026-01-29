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

(async () => {
  const files = await globby(TRACE_PATHS);

  for (const file of files) {
    const content = readFileSync(file, "utf8");
    for (const forbidden of FORBIDDEN) {
      if (content.includes(forbidden)) {
        console.error(`[FORBIDDEN] ${forbidden} found in ${file}`);
        violations++;
      }
    }
  }

  if (violations > 0) {
    process.exit(1);
  } else {
    console.log("NO_RANDOM_TRACE_IDS: PASS");
  }
})();
