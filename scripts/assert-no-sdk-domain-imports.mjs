import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const FORBIDDEN = "@vercel/sdk";

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      scan(p);
    } else if (entry.name.endsWith(".ts")) {
      const src = fs.readFileSync(p, "utf8");
      if (
        src.includes(`from "${FORBIDDEN}"`) ||
        src.includes(`from '${FORBIDDEN}'`)
      ) {
        console.error(`❌ Forbidden SDK import in ${p}`);
        process.exit(1);
      }
    }
  }
}

scan(path.join(ROOT, "packages"));
console.log("✅ SDK boundary invariant satisfied");
