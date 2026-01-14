import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const API_DIR = path.join(ROOT, "apps/web/app/api");

const forbidden = [
  /from\s+["']@bickford\/db["']/,
  /from\s+["']@prisma\/client["']/,
  /PrismaClient/,
  /@\/lib\/prisma/, // <--- NEW: forbid local prisma facade
];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === "route.ts") checkFile(full);
  }
}

function checkFile(file) {
  const contents = fs.readFileSync(file, "utf8");
  for (const rule of forbidden) {
    if (rule.test(contents)) {
      if (contents.includes("@/lib/prisma")) {
        console.error(
          `❌ Local prisma facade is forbidden in API route: ${file}\nImport getPrisma from @bickford/db.`
        );
      } else {
        console.error(`❌ Prisma import detected in API route: ${file}`);
      }
      process.exit(1);
    }
  }
}

walk(API_DIR);
console.log("✅ No forbidden Prisma imports in App Router API routes");
