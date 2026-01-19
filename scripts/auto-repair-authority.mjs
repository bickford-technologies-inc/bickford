import fs from "fs";
import { execSync } from "child_process";

const pkg = "packages/authority";

if (!fs.existsSync(`${pkg}/dist`)) {
  console.log("🔧 auto-repair: building @bickford/authority");
  execSync("pnpm --filter @bickford/authority build", { stdio: "inherit" });
} else {
  console.log("🧠 detected canonical type drift in @bickford/authority");
  console.log("🚫 auto-repair blocked: invariant violation");
  console.log(
    "📣 action required: update imports to match @bickford/types canon",
  );

  process.exit(1);
}
