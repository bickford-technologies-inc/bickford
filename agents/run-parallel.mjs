import { exec } from "child_process";
import fs from "fs";

const owners = JSON.parse(fs.readFileSync("agents/owners.json", "utf8"));
const changed = execSync("git diff --name-only origin/main", {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean);

const targets = new Set();

for (const f of changed) {
  for (const pkg of Object.keys(owners)) {
    if (f.includes(pkg.replace("@bickford/", "packages/"))) {
      targets.add(pkg);
    }
  }
}

const procs = [];

for (const pkg of targets) {
  console.log("🚀 spawning agent for", pkg);
  procs.push(
    new Promise((res, rej) => {
      const p = exec(`pnpm --filter ${pkg} build`, (err) =>
        err ? rej(err) : res(),
      );
      p.stdout?.pipe(process.stdout);
      p.stderr?.pipe(process.stderr);
    }),
  );
}

await Promise.all(procs);
