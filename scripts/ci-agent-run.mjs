#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { execSync } from "child_process";
import "./auto-repair-types-compat.mjs";
import { decay, reward, evictIfNeeded } from "./agent-trust.mjs";

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status);
}

const agent = "ci-agent";

try {
  evictIfNeeded(agent);
  reward(agent);
} catch (e) {
  decay(agent, 20);
  throw e;
}

/* AGENT CONTRACT:
   - No agent may build or deploy without preflight passing
*/

execSync("node scripts/auto-repair-authority.mjs", { stdio: "inherit" });
run("pnpm", ["install"]);
run("pnpm", ["preflight"]);
run("pnpm", ["-r", "--filter", "@bickford/*", "run", "build"]);
