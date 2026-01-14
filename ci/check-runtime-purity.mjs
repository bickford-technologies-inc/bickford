import fs from "fs";
import path from "path";

const ROOTS = ["apps", "packages"];

const FORBIDDEN_BUILD_SIDE_EFFECTS = [
  "@prisma/client",
  "new PrismaClient",
  "redis",
  "ioredis",
  "pg",
  "mysql",
  "fs.",
  "child_process",
  "process.env",
  "fetch(",
  "axios",
];

function scanFile(file) {
  const text = fs.readFileSync(file, "utf8");
  for (const rule of FORBIDDEN_BUILD_SIDE_EFFECTS) {
    if (
      text.includes(rule) &&
      !text.includes("await import") &&
      !text.includes("runtime-only") &&
      !text.includes("force-dynamic")
    ) {
      console.error(`❌ Runtime purity violation: ${file}`);
      process.exit(1);
    }
  }
}

function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (/\.(ts|tsx|js)$/.test(f)) scanFile(full);
  }
}

ROOTS.forEach(walk);
console.log("✅ Runtime purity invariant holds");
