import { execSync } from "child_process";

execSync("git fetch origin main", { stdio: "ignore" });

const diff = execSync("git diff origin/main...HEAD -- CANON", {
  encoding: "utf8",
});

if (!diff.trim()) process.exit(0);

execSync("git checkout -b canon-migration", { stdio: "inherit" });

execSync("pnpm exec node scripts/generate-migrations.mjs", {
  stdio: "inherit",
});

execSync('git commit -am "chore: canon migration"', { stdio: "inherit" });
execSync("git push origin canon-migration", { stdio: "inherit" });

execSync(
  'gh pr create --title "Canon Migration" --body "Auto-generated migration"',
  { stdio: "inherit" },
);
