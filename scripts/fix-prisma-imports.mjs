import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "apps/web/src");

function walk(dir) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (file.endsWith(".ts")) fix(full);
  }
}

function fix(file) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("getPrisma")) return;

  src = src
    .replace(
      /import\s+\{\s*getPrisma\s*\}\s+from\s+["']@\/lib\/prisma["']/g,
      'import { prisma } from "@/lib/prisma"'
    )
    .replace(/getPrisma\(\)/g, "prisma");

  fs.writeFileSync(file, src);
  console.log("Fixed:", file);
}

walk(ROOT);
