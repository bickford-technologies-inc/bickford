import { execSync } from "node:child_process";

console.log("🔧 auto-repair: ensuring @bickford/types compatibility surface");

execSync("pnpm --filter @bickford/types build", { stdio: "inherit" });
