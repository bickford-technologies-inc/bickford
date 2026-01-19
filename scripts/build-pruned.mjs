import { execSync } from "child_process";

const pkgs = execSync("node scripts/prune-builds.mjs", { encoding: "utf8" })
  .split(" ")
  .filter(Boolean);

if (pkgs.length === 0) {
  console.log("✅ no builds required");
  process.exit(0);
}

for (const pkg of pkgs) {
  console.log("🏗️ building", pkg);
  execSync(`pnpm --filter ${pkg} build`, { stdio: "inherit" });
}
