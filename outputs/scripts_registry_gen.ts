#!/usr/bin/env bun
/**
 * @meta
 * name: Scripts Registry Generator
 * description: Generates a registry of all scripts and their metadata in outputs/scripts_registry.json
 * category: utility
 * author: Bickford Automation
 * last_updated: 2026-01-28
 * dependencies: none
 */
import { log, logError } from "./logger";
// Bun environment check
if (typeof Bun === "undefined") {
  logError(
    "[scripts_registry_gen.ts] ERROR: This script must be run with Bun. See outputs/DEVELOPER_ONBOARDING.md.",
  );
  process.exit(1);
}

// Usage/help
if (process.argv.includes("--help")) {
  console.log(
    `Usage: bun run outputs/scripts_registry_gen.ts\nGenerates a registry of all scripts and their metadata in outputs/scripts_registry.json.`,
  );
  process.exit(0);
}

import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
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

function parseMeta(script: string): any {
  const content = readFileSync(script, "utf-8");
  const match = content.match(/\/\*\*([\s\S]*?)\*\//);
  if (!match) return {};
  const meta: any = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/\*\s*@meta|\*\s*(\w+):\s*(.*)/);
    if (m && m[1]) meta[m[1].trim()] = m[2].trim();
  }
  return meta;
}

const scripts = findScripts("outputs");
const registry = scripts.map((s) => ({ path: s, ...parseMeta(s) }));
writeFileSync(
  "outputs/scripts_registry.json",
  JSON.stringify(registry, null, 2),
);
console.log(
  "Generated outputs/scripts_registry.json with metadata for all scripts.",
);
// TODO: Add registry validation and dashboard integration.
