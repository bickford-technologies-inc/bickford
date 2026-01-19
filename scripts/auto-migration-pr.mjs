#!/usr/bin/env node
#!/usr/bin/env node
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migrationsDir = path.join(root, "packages/db/prisma/migrations");

if (!fs.existsSync(migrationsDir)) {
  console.log("No prisma migrations directory found");
  process.exit(0);
}

const status = execSync("git status --porcelain", { encoding: "utf8" });
const changed = status
  .split("\n")
  .filter((l) => l.includes("prisma/migrations/"));

if (changed.length === 0) {
  console.log("No new migrations detected");
  process.exit(0);
}

const branch = `auto/migration-${Date.now()}`;

execSync(`git checkout -b ${branch}`, { stdio: "inherit" });
execSync(`git add packages/db/prisma/migrations`, { stdio: "inherit" });
execSync(`git commit -m "chore(db): add prisma migration"`, {
  stdio: "inherit",
});
execSync(`git push origin ${branch}`, { stdio: "inherit" });

execSync(
  `gh pr create \
    --title "Prisma migration" \
    --body "Auto-generated migration PR\n\nInvariant: schema drift must be reviewed" \
    --label canon,migration,auto`,
  { stdio: "inherit" }
);

console.log("✅ Migration PR created");

import { execSync } from "child_process";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const MIGRATIONS_DIR = "prisma/migrations";
const BRANCH_PREFIX = "auto/migration-";

function getUncommittedMigrations() {
  // List uncommitted migration directories
  const output = execSync("git status --porcelain", { encoding: "utf8" });
  return output
    .split("\n")
    .filter((line) => line.match(/prisma\/migrations\//))
    .map((line) => line.replace(/^\s*[AM]\s+/, "").trim())
    .filter((f) => f.endsWith("migration.sql"));
}

function main() {
  const uncommitted = getUncommittedMigrations();
  if (uncommitted.length === 0) {
    console.log("No new migrations to PR.");
    process.exit(0);
  }

  const timestamp = Date.now();
  const branch = `${BRANCH_PREFIX}${timestamp}`;

  execSync(`git checkout -b ${branch}`, { stdio: "inherit" });
  execSync("git add prisma/migrations", { stdio: "inherit" });
  execSync(`git commit -m "chore: add new Prisma migration(s) [auto]"`, {
    stdio: "inherit",
  });
  execSync(`git push -u origin ${branch}`, { stdio: "inherit" });

  // Open PR using GitHub CLI
  execSync(
    `gh pr create --title "chore: add new Prisma migration(s) [auto]" --body "Auto-generated PR for new Prisma migration(s)." --base main`,
    { stdio: "inherit" },
  );

  console.log("✅ Migration PR created.");
}

main();
