#!/usr/bin/env node
import { execSync } from "node:child_process";

const run = (cmd) => {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { stdio: "inherit" });
};

const branch =
  process.argv[2] || execSync("git branch --show-current").toString().trim();

if (!branch) {
  console.error("❌ Could not determine branch");
  process.exit(1);
}

run("git diff --quiet");
run("git diff --cached --quiet");

run(`git checkout ${branch}`);
run("git fetch origin");
run("git rebase origin/main");

run("npm run build");

run("git add -A");

try {
  run(`git diff --cached --quiet`);
  console.log("ℹ️ No changes to commit");
} catch {
  run(`git commit -m \"chore: resolve conflicts and converge to main\"`);
}

run(`git push origin ${branch}`);

// Print PR merge URL
const repoUrl = execSync("git config --get remote.origin.url")
  .toString()
  .trim()
  .replace(/.*github.com[:\/](.*)\.git/, "$1");
console.log(
  `\n🔗 Merge: https://github.com/${repoUrl}/compare/${branch}?expand=1`
);

console.log("\n✅ Branch is build-clean and ready to merge.");
