import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TARGET = path.join(ROOT, "packages", "execution-convergence", "src");

const FILES = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (p.endsWith(".ts") || p.endsWith(".tsx")) FILES.push(p);
  }
}

walk(TARGET);

const REPLACEMENTS = [
  [
    /import\s+crypto\s+from\s+["']node:crypto["'];?/g,
    `import * as crypto from "node:crypto";`,
  ],
  [/import\s+fs\s+from\s+["']fs["'];?/g, `import * as fs from "fs";`],
  [/import\s+fs\s+from\s+["']node:fs["'];?/g, `import * as fs from "node:fs";`],
  [/import\s+path\s+from\s+["']path["'];?/g, `import * as path from "path";`],
  [
    /import\s+path\s+from\s+["']node:path["'];?/g,
    `import * as path from "node:path";`,
  ],
];

for (const file of FILES) {
  let src = fs.readFileSync(file, "utf8");
  let changed = false;

  for (const [regex, replacement] of REPLACEMENTS) {
    if (regex.test(src)) {
      src = src.replace(regex, replacement);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, src);
    console.log("✔ patched", path.relative(ROOT, file));
  }
}
