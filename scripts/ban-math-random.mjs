import fs from "fs";
import path from "path";

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
      if (src.match(/\bMath\.random\s*\(/)) {
        console.error("❌ Math.random() forbidden outside adapters:", full);
        violated = true;
      }
    }
  }
}

scan(process.cwd());

if (violated) process.exit(1);
console.log("✅ Math.random() correctly isolated to adapters");
