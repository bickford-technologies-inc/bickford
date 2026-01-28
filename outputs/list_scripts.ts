#!/usr/bin/env bun
/**
 * @meta
 * name: Script Index
 * description: Lists all runnable scripts in outputs/ and subdirectories, printing their --help output if available
 * category: utility
 * author: Bickford Automation
 * last_updated: 2026-01-28
 * dependencies: none
 */
import { log, logError } from "./logger";
// Bun environment check
if (typeof Bun === "undefined") {
  logError(
    "[list_scripts.ts] ERROR: This script must be run with Bun. See outputs/DEVELOPER_ONBOARDING.md.",
  );
  process.exit(1);
}

// Usage/help
if (process.argv.includes("--help")) {
  console.log(
    `Usage: bun run outputs/list_scripts.ts\nLists all runnable scripts in outputs/ and subdirectories, printing their --help output if available.`,
  );
  process.exit(0);
}

import { readdirSync, statSync, existsSync, spawnSync } from "fs";
import { join } from "path";

function findScripts(dir: string): string[] {
  let scripts: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      scripts = scripts.concat(findScripts(full));
    } else if (entry.endsWith(".ts") && !entry.endsWith(".test.ts")) {
      scripts.push(full);
    }
  }
  return scripts;
}

const scripts = findScripts("outputs");
console.log("\nBickford Automation: Script Index\n---");
for (const script of scripts) {
  console.log(`\n▶ ${script}`);
  const result = spawnSync("bun", ["run", script, "--help"], {
    encoding: "utf-8",
  });
  if (result.stdout) {
    console.log(result.stdout.trim());
  } else {
    console.log("(No --help output)");
  }
}
// TODO: Add script metadata extraction in future.
// EXTENSION POINT: Add script categorization or tags.
