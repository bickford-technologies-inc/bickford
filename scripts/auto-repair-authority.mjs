import fs from "fs";
import { execSync } from "child_process";

const pkg = "packages/authority";

if (!fs.existsSync(`${pkg}/dist`)) {
  console.log("🔧 auto-repair: building @bickford/authority");
  execSync("pnpm --filter @bickford/authority build", { stdio: "inherit" });
}
