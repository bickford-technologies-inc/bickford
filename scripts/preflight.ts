import { execSync } from "child_process";

function run(cmd: string) {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
}

run("tsx scripts/enforce-web-boundary.ts");
run("tsx scripts/verify-workspace.ts");
run("pnpm install");
run("pnpm run build");
