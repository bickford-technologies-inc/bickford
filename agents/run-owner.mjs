import fs from "fs";
import { execSync } from "child_process";

const owners = JSON.parse(fs.readFileSync("agents/owners.json", "utf8"));
const changed = execSync("git diff --name-only HEAD~1", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

for (const file of changed) {
  const match = Object.keys(owners).find((p) =>
    file.includes(p.replace("@bickford/", "packages/")),
  );
  if (!match) continue;

  const agent = owners[match];
  console.log(`🤖 ${agent} handling ${match}`);
  execSync(`pnpm --filter ${match} build`, { stdio: "inherit" });
}
