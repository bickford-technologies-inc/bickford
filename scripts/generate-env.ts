#!/usr/bin/env bun
/**
 * generate-env.ts
 *
 * Generates .env and .env.example files for local development from env.manifest.json.
 * Excludes sealed/production secrets from .env, but includes all keys in .env.example.
 */

import { readFileSync, writeFileSync } from "fs";

const manifest = JSON.parse(readFileSync("./env.manifest.json", "utf-8"));

function isLocalEnv(envs) {
  return envs.includes("dev") || envs.includes("all");
}

let envOut = "";
let exampleOut = "";

// Shared variables
for (const [name, def] of Object.entries(manifest.shared)) {
  if (!def.sealed && isLocalEnv(def.env)) {
    envOut += `${name}=${def.value}\n`;
  }
  exampleOut += `${name}=\n`;
}
// Service variables
for (const [service, vars] of Object.entries(manifest.services)) {
  for (const [name, def] of Object.entries(vars)) {
    if (!def.sealed && isLocalEnv(def.env)) {
      envOut += `${name}=${def.value}\n`;
    }
    exampleOut += `${name}=\n`;
  }
}

writeFileSync(".env", envOut);
writeFileSync(".env.example", exampleOut);
console.log("✅ .env and .env.example generated.");
