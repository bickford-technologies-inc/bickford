import fs from "fs";
import path from "path";

const forbidden = [/export const runtime\s*=\s*["']/, /\.prisma\/client/];

function scan(dir: string) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) scan(p);
    else {
      const src = fs.readFileSync(p, "utf8");
      for (const rule of forbidden) {
        if (rule.test(src)) {
          throw new Error(`Forbidden pattern in ${p}`);
        }
      }
    }
  }
}

["apps", "packages"].forEach(scan);
