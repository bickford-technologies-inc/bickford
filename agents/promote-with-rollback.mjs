import { execSync } from "child_process";

try {
  execSync("node promotions/snapshot.mjs", { stdio: "inherit" });
  execSync("node agents/quorum-resolve.mjs", { stdio: "inherit" });
  execSync("node promotions/escalate.mjs", { stdio: "inherit" });
} catch (err) {
  console.error("⚠️ promotion failed, rolling back");
  execSync("node promotions/rollback.mjs", { stdio: "inherit" });
  process.exit(1);
}
