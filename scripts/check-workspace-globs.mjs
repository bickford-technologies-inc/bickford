#!/usr/bin/env node

import fs from "fs";
import path from "path";
import yaml from "yaml";
import glob from "fast-glob";

const WORKSPACE_FILE = "pnpm-workspace.yaml";

function fail(msg) {
  console.error(`\n❌ [WORKSPACE_GLOB_VIOLATION]\n${msg}\n`);
  process.exit(1);
}

if (!fs.existsSync(WORKSPACE_FILE)) {
  fail(`Missing ${WORKSPACE_FILE}`);
}

const raw = fs.readFileSync(WORKSPACE_FILE, "utf8");
const parsed = yaml.parse(raw);

if (!parsed?.packages || !Array.isArray(parsed.packages)) {
  fail(`Invalid or missing 'packages' array in ${WORKSPACE_FILE}`);
}

const cwd = process.cwd();

for (const pattern of parsed.packages) {
  const matches = glob.sync(pattern, {
    cwd,
    onlyDirectories: true,
    dot: false,
  });

  if (matches.length === 0) {
    fail(
      `Workspace glob "${pattern}" does not match any directories.\n` +
        `→ This would cause pnpm workspace resolution failure.\n` +
        `→ Either fix the glob or create the directory.`
    );
  }
}

console.log("✅ Workspace glob validation passed.");
