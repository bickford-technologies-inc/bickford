const fs = require("fs");

const entry = {
  timestamp: new Date().toISOString(),
  phase: process.env.BUILD_PHASE || "unknown",
  errorClass: process.env.ERROR_CLASS || "unknown",
  stackRoot: process.env.ERROR_FILE || "unknown",
};

fs.appendFileSync(
  ".bickford/build-failures.jsonl",
  JSON.stringify(entry) + "\n"
);
