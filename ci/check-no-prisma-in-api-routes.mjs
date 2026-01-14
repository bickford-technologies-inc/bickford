import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const API_DIR = path.join(ROOT, "apps/web/app/api");

const forbidden = [
  /from\s+["']@bickford\/db["']/, 
  /from\s+["']@prisma\/client["']/, 
  /PrismaClient/,
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
      console.error(`❌ Prisma import detected in API route: ${file}`);
      process.exit(1);
    }
  }
}

walk(API_DIR);
console.log("✅ No forbidden Prisma imports in App Router API routes");
