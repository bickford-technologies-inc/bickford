import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const VIOLATIONS = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      scanFile(full);
    }
  }
}

function scanFile(file) {
  const src = fs.readFileSync(file, "utf8");

  const forbidden = [
    /from\s+["']@\/lib\//,
    /from\s+["']@\/internal\//,
    /from\s+["']\.\.\/.*\/lib\//,
    /from\s+["']\.\.\/.*\/internal\//,
  ];

  forbidden.forEach((re) => {
    if (re.test(src)) {
      VIOLATIONS.push({ file, reason: re.toString() });
    }
  });
}

walk(path.join(ROOT, "packages"));
walk(path.join(ROOT, "apps"));

if (VIOLATIONS.length) {
  console.error("❌ PROMOTION VIOLATIONS DETECTED\n");
  for (const v of VIOLATIONS) {
    console.error(`- ${v.file}`);
    console.error(`  reason: ${v.reason}`);
  }
  console.error("\nRequired action: promote module to @bickford/* package");
  process.exit(1);
}

console.log("✅ No promotion violations detected");
