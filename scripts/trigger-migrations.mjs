import fs from "node:fs";
import { execSync } from "node:child_process";

const canon = JSON.parse(fs.readFileSync("CANON/version.json", "utf8"));
const changes = JSON.parse(fs.readFileSync("CANON/changes.json", "utf8"));

for (const ch of changes.migrations || []) {
  const branch = `migration/${canon.version}/${ch.id}`;
  execSync(`git checkout -B ${branch}`, { stdio: "inherit" });
  execSync(`node ${ch.script}`, { stdio: "inherit" });
  execSync(`git add .`, { stdio: "inherit" });
  execSync(`git commit -m "migration(${canon.version}): ${ch.id}"`, {
    stdio: "inherit",
  });
  execSync(`git push origin ${branch}`, { stdio: "inherit" });
  execSync(
    `gh pr create --title "migration: ${ch.id}" --body "Auto-generated from canon ${canon.version}"`,
    { stdio: "inherit" },
  );
}

console.log("✅ migrations triggered");
