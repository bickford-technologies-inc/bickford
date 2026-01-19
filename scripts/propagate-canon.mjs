import { execSync } from "child_process";
import fs from "fs";

const TARGET_REPOS = [
  "bickford-platform",
  "bickford-mobile",
  "bickford-defense",
];

for (const repo of TARGET_REPOS) {
  execSync(
    `git clone https://github.com/bickford-technologies-inc/${repo}.git`,
    { stdio: "inherit" },
  );
  execSync(`cp -R CANON ${repo}/CANON`, { stdio: "inherit" });

  execSync(`cd ${repo} && git checkout -b canon-sync`, { stdio: "inherit" });
  execSync(
    `cd ${repo} && git add CANON && git commit -m "canon: sync update"`,
    { stdio: "inherit" },
  );
  execSync(`cd ${repo} && git push origin canon-sync`, { stdio: "inherit" });

  execSync(
    `cd ${repo} && gh pr create --title "Canon Sync" --body "Automated canon propagation"`,
    { stdio: "inherit" },
  );
}
