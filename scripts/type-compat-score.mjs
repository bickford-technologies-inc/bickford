import fs from "fs";
import path from "path";

const CANON = fs.readFileSync("packages/types/src/index.ts", "utf8");

const canonExports = new Set(
  [...CANON.matchAll(/export\s+(type\s+)?\{([^}]+)\}/g)].flatMap((m) =>
    m[2].split(",").map((s) => s.trim()),
  ),
);

const scores = {};

function scan(pkg) {
  const src = path.join(pkg, "src");
  if (!fs.existsSync(src)) return;

  let used = new Set();

  for (const f of fs.readdirSync(src)) {
    if (!f.endsWith(".ts")) continue;
    const text = fs.readFileSync(path.join(src, f), "utf8");
    for (const m of text.matchAll(
      /import\s+\{([^}]+)\}\s+from\s+["']@bickford\/types["']/g,
    )) {
      m[1]
        .split(",")
        .map((s) => s.trim())
        .forEach((x) => used.add(x));
    }
  }

  const valid = [...used].filter((x) => canonExports.has(x)).length;
  scores[path.basename(pkg)] = used.size
    ? Math.round((valid / used.size) * 100)
    : 100;
}

fs.readdirSync("packages")
  .map((p) => `packages/${p}`)
  .forEach(scan);

fs.writeFileSync("artifacts/type-compat.json", JSON.stringify(scores, null, 2));

for (const [pkg, score] of Object.entries(scores)) {
  console.log(`📊 ${pkg}: ${score}% compatible`);
  if (score < 80) process.exit(1);
}
