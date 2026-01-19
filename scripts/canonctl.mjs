#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const cmd = process.argv[2];

function run(bin, args) {
  const r = spawnSync(bin, args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

switch (cmd) {
  case "migrate":
    run("node", ["scripts/trigger-migrations.mjs"]);
    break;
  case "enforce-deprecations":
    run("node", ["scripts/enforce-deprecations.mjs"]);
    break;
  case "render-dag":
    run("node", ["scripts/render-canon-dag.mjs"]);
    break;
  default:
    console.error(
      "Usage: canonctl.mjs <migrate|enforce-deprecations|render-dag>",
    );
    process.exit(1);
}
