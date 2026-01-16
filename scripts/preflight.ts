import { execSync } from "child_process";

function run(cmd: string) {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

run("tsx scripts/enforce-web-boundary.ts");
run("tsx scripts/verify-workspace.ts");
run("bash ci/guards/ENVIRONMENT_PRECONDITION.sh && corepack enable && corepack prepare pnpm@9.15.0 --activate && pnpm install --frozen-lockfile");
run("pnpm run build");
