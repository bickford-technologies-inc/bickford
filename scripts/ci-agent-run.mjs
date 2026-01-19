#!/usr/bin/env node
import { spawnSync } from "node:child_process";

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status);
}

/* AGENT CONTRACT:
   - No agent may build or deploy without preflight passing
*/

run("pnpm", ["install"]);
run("pnpm", ["preflight"]);
run("pnpm", ["-r", "--filter", "@bickford/*", "run", "build"]);
