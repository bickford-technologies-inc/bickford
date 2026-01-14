import { execSync } from "node:child_process";

try {
  execSync(`grep -R "if (.*export .*function" apps/web/src/app`, {
    stdio: "inherit",
  });
  console.error("❌ Conditional export detected");
  process.exit(1);
} catch {
  process.exit(0);
}
