import { spawnSync } from "child_process";

const r = spawnSync("pnpm", ["exec", "tsc", "--version"], {
  stdio: "ignore",
});

if (r.status !== 0) {
  console.error(
    "❌ tsc not available. Use pnpm exec and ensure typescript is installed.",
  );
  process.exit(1);
}

console.log("✅ tsc available");
