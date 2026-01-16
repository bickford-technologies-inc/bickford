#!/usr/bin/env node
import fs from "fs";

const logPath = process.argv[2];
if (!logPath) {
  console.error("Usage: classify-build-log <logfile>");
  process.exit(1);
}

const log = fs.readFileSync(logPath, "utf8");
const has = (s) => log.includes(s);

let classification = "UNKNOWN";
let action = "Inspect logs manually.";

if (!has("NODE:")) {
  classification = "ENVIRONMENT_DRIFT";
  action = "Node guard not executed. Fix install command or CI wiring.";
}

if (has("NODE:") && !has("NODE: v20")) {
  classification = "ENVIRONMENT_DRIFT";
  action = "Node version mismatch. Enforce Node 20.";
}

if (has("ERR_INVALID_THIS") || has("registry.npmjs.org")) {
  classification = "TRANSPORT_FAILURE";
  action = "Registry transport failure. Fix Node/pnpm/undici pairing.";
}

if (has("ERR_PNPM_NO_MATCHING_VERSION_INSIDE_WORKSPACE")) {
  classification = "WORKSPACE_INTEGRITY";
  action = "Workspace package missing or misdeclared.";
}

if (
  has("next build failed") ||
  has("TypeScript error") ||
  has("Build error occurred")
) {
  classification = "BUILD_ERROR";
  action = "Application build error. Fix code.";
}

const result = {
  classification,
  action,
  timestamp: new Date().toISOString(),
};

fs.writeFileSync(
  "build-diagnosis.json",
  JSON.stringify(result, null, 2)
);

console.log("🔍 Build Diagnosis:");
console.log(JSON.stringify(result, null, 2));
