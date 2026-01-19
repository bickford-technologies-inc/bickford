import { spawnSync } from "node:child_process";

const res = spawnSync("node", ["scripts/require-gh-token.mjs"], {
  stdio: "inherit",
});

if (res.status === 10) {
  console.log("🔁 PR-only propagation mode");
}

spawnSync("node", ["scripts/propagate-canon.mjs"], { stdio: "inherit" });
