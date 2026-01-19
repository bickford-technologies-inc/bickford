import fs from "node:fs";
import { execSync } from "node:child_process";

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const targets = JSON.parse(fs.readFileSync("CANON/targets.json", "utf8"));

function run(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

for (const repo of targets.repos) {
  const dir = repo.split("/")[1];

  try {
    run(`rm -rf /tmp/${dir}`);
    run(
      `git clone https://${token ? token + "@" : ""}github.com/${repo}.git /tmp/${dir}`,
    );
    run(`rsync -a CANON/ /tmp/${dir}/CANON/`);
    run(`cd /tmp/${dir} && git checkout -b canon/sync-${Date.now()}`);
    run(`cd /tmp/${dir} && git add CANON`);
    run(`cd /tmp/${dir} && git commit -m "canon: sync canon update"`);

    if (token) {
      run(`cd /tmp/${dir} && git push origin HEAD`);
      console.log(`✅ pushed canon to ${repo}`);
    }
  } catch {
    console.warn(`⚠️ push failed for ${repo}, opening PR`);
    run(`gh repo fork ${repo} --clone=false || true`);
    run(
      `cd /tmp/${dir} && gh pr create --title "canon: sync update" --body "Automated canon propagation"`,
    );
  }
}
