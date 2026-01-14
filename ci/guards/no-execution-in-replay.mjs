import fs from "fs";
import path from "path";

const ROOT = "apps/web/src/app/api";
const FORBIDDEN = [
  ".execute(",
  "executeIntent",
  "runExecution",
  "enqueueExecution",
];

function scan(dir) {
  for (const file of fs.readdirSync(dir)) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) scan(p);
    else if (p.includes("/replay/") && p.endsWith(".ts")) {
      const content = fs.readFileSync(p, "utf8");
      for (const token of FORBIDDEN) {
        if (content.includes(token)) {
          throw new Error(
            `❌ Execution token "${token}" found in replay route: ${p}`
          );
        }
      }
    }
  }
}

scan(ROOT);
console.log("✅ Replay routes verified non-executing");