import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const forbidden = [];

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const p = path.join(dir, entry.name);
      if (
        entry.name === ".prisma" &&
        !p.startsWith(path.join(root, "node_modules"))
      ) {
        forbidden.push(p);
      }
      scan(p);
    }
  }
}

scan(root);

if (forbidden.length > 0) {
  console.error("❌ Multiple Prisma client directories detected:");
  forbidden.forEach((p) => console.error(" -", p));
  process.exit(1);
}

console.log("✅ Single Prisma client invariant satisfied");
