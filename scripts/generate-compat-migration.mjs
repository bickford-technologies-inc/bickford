import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const ROOT = process.cwd();
const COMPAT_IMPORT = "@bickford/types/compat";
const REPLACEMENT = "@bickford/types";

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry);
    if (p.includes("node_modules") || p.includes("dist")) continue;
    if (fs.statSync(p).isDirectory()) walk(p, acc);
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) acc.push(p);
  }
  return acc;
}

let touched = false;

for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, "utf8");
  if (!src.includes(COMPAT_IMPORT)) continue;

  fs.writeFileSync(
    file,
    src.replace(
      new RegExp(`from ["']${COMPAT_IMPORT}["']`, "g"),
      `from "${REPLACEMENT}"`
    )
  );
  touched = true;
  console.log("UPDATED:", file);
}

if (!touched) {
  console.log("No compat imports found.");
  process.exit(0);
}

execSync("git checkout -b migrate/remove-compat", { stdio: "inherit" });
execSync(
  "git commit -am 'chore(canon): remove deprecated compat imports'",
  { stdio: "inherit" }
);

console.log("🚀 Migration branch ready for PR");
