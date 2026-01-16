import fs from "fs";
import path from "path";

const ROOT = process.cwd();
let violated = false;

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (full.includes("node_modules") || full.includes("dist")) continue;
      scan(full);
    }

    if (
      entry.isFile() &&
      full.endsWith(".ts") &&
      !full.includes("/adapters/")
    ) {
      const src = fs.readFileSync(full, "utf8");
      if (src.match(/\bDate\.now\s*\(/)) {
        console.error("❌ Date.now() forbidden outside adapters:", full);
        violated = true;
      }
    }
  }
}

scan(ROOT);

if (violated) {
  process.exit(1);
}

console.log("✅ Date.now() usage correctly isolated to adapters");
