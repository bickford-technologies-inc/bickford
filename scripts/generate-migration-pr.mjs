import fs from "node:fs";
import { execSync } from "node:child_process";

const symbols = JSON.parse(fs.readFileSync("CANON/symbols.json", "utf8"));

for (const [oldSym, meta] of Object.entries(symbols)) {
  if (!meta.replacedBy) continue;

  execSync(
    `rg -l "\\b${oldSym}\\b" packages | xargs sed -i '' 's/\\b${oldSym}\\b/${meta.replacedBy}/g'`,
  );
}

execSync("git checkout -b canon/migrate-types", { stdio: "inherit" });
execSync("git add .", { stdio: "inherit" });
execSync(
  `git commit -m "canon: migrate deprecated types to canonical replacements"`,
  { stdio: "inherit" },
);
