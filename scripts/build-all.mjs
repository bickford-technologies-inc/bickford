import { execSync } from "node:child_process";

// Replacement for legacy scripts/build-all.sh.

const run = (command) => {
  execSync(command, { stdio: "inherit" });
};

run("pnpm install");
run("pnpm --filter @bickford/types build");
run("pnpm -r --filter @bickford/* build");