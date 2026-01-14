import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const FORBIDDEN = ['fs.readFileSync("apps/', "fs.readFileSync('apps/"];

function scan(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(full);
    else if (entry.isFile() && entry.name.endsWith(".ts")) {
      const content = fs.readFileSync(full, "utf8");
      for (const bad of FORBIDDEN) {
        if (content.includes(bad)) {
          throw new Error(
            `[CANON_VIOLATION] cwd-relative path detected in ${full}`
          );
        }
      }
    }
  }
}

scan(path.join(ROOT, "scripts"));
console.log("✔ no cwd-relative paths detected");
