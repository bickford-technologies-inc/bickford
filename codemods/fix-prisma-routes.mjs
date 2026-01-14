import fs from "fs";
import path from "path";

const ROOT = "apps/web/app";

function fix(file) {
  let t = fs.readFileSync(file, "utf8");

  if (
    t.includes('from "@bickford/db"') ||
    t.includes('from "@prisma/client"')
  ) {
    t = t.replace(/import .*?@bickford\/db.*?;\n?/g, "");
    t = t.replace(/import .*?@prisma\/client.*?;\n?/g, "");

    if (!t.includes("force-dynamic")) {
      t = `export const dynamic = "force-dynamic";\n\n` + t;
    }

    t = t.replace(
      /export async function (\w+)\((.*?)\)\s*{/, // only first handler
      `export async function $1($2) {\n  const { prisma } = await import("@bickford/db");`
    );

    fs.writeFileSync(file, t);
    console.log(`🛠️ fixed ${file}`);
  }
}

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (f === "route.ts") fix(full);
  }
}

walk(ROOT);
