#!/usr/bin/env bun
/**
 * sync-railway-vars.ts
 *
 * Syncs environment variables from env.manifest.json to Railway using the Railway CLI.
 * Handles shared, service, and sealed variables for all environments.
 * Requires Railway CLI to be installed and authenticated.
 */

import { readFileSync } from "fs";
import { execSync } from "child_process";

const manifest = JSON.parse(readFileSync("./env.manifest.json", "utf-8"));

function setVar(service, name, value, sealed, env) {
  if (sealed) {
    console.warn(
      `⚠️  Skipping sealed variable '${name}' for service '${service}' in env '${env}'.`,
    );
    console.warn(
      `   → Sealed variables must be set and sealed manually in the Railway UI.`,
    );
    return;
  }
  let cmd = `railway variables set ${name}='${value}'`;
  if (service !== "shared") cmd += ` --service=${service}`;
  if (env && env !== "all") cmd += ` --environment=${env}`;
  console.log("$", cmd);
  execSync(cmd, { stdio: "inherit" });
}

for (const [name, def] of Object.entries(manifest.shared)) {
  for (const env of def.env) {
    setVar("shared", name, def.value, def.sealed, env);
  }
}
for (const [service, vars] of Object.entries(manifest.services)) {
  for (const [name, def] of Object.entries(vars)) {
    for (const env of def.env) {
      setVar(service, name, def.value, def.sealed, env);
    }
  }
}

console.log("\n✅ Railway variables sync complete.");
