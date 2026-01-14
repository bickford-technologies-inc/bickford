import fs from "fs";
import path from "path";

const ROOT = "apps/web/app";
const banned = [
  "@prisma/client",
  "new PrismaClient",
  'from "@bickford/db"',
  "from '@bickford/db'",
];

function scan(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) scan(full);
    else if (f === "route.ts") {
      const txt = fs.readFileSync(full, "utf8");
      for (const b of banned) {
        if (txt.includes(b) && !txt.includes("await import")) {
          console.error(`❌ Prisma boundary violation: ${full}`);
          process.exit(1);
        }
      }
    }
  }
}

scan(ROOT);
console.log("✅ Prisma boundary invariant holds");
