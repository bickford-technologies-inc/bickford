import { execSync } from "node:child_process";

function fail(msg: string) {
  console.error("❌", msg);
  process.exit(1);
}

try {
  execSync("npm ls @types/react --all | grep @types/react@", { stdio: "pipe" });
} catch {
  fail("Multiple React types detected");
}

console.log("✅ CI Doctor: clean");
