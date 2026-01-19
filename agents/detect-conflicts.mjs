import { execSync } from "child_process";

const files = execSync("git diff --name-only origin/main", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const pkgs = new Set();

for (const f of files) {
  const m = f.match(/packages\/([^/]+)/);
  if (m) pkgs.add(`@bickford/${m[1]}`);
}

if (pkgs.size > 1) {
  console.log(JSON.stringify([...pkgs]));
} else {
  console.log("[]");
}
