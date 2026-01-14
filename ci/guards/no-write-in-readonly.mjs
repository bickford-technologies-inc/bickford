import fs from "fs";
import path from "path";

const ROOT = "apps/web/src/app/api";
const WRITE_TOKENS = [".create(", ".update(", ".delete("];

function scan(dir) {
  for (const file of fs.readdirSync(dir)) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) scan(p);
    else if (p.endsWith(".ts")) {
      const content = fs.readFileSync(p, "utf8");

      if (
        content.includes("Replay") ||
        content.includes("read-only") ||
        content.includes("replay")
      ) {
        for (const token of WRITE_TOKENS) {
          if (content.includes(token) && !content.includes("lastReplayedAt")) {
            throw new Error(
              `❌ Write operation "${token}" found in read-only route: ${p}`
            );
          }
        }
      }
    }
  }
}

scan(ROOT);
console.log("✅ Read-only routes verified mutation-safe");
