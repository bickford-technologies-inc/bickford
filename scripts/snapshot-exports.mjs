import fs from "node:fs";
import path from "node:path";

const packagesDir = path.resolve("packages");
const snapshot = {};

for (const pkg of fs.readdirSync(packagesDir)) {
  const dist = path.join(packagesDir, pkg, "dist", "index.d.ts");
  if (!fs.existsSync(dist)) continue;

  const contents = fs.readFileSync(dist, "utf8");
  const exports = [
    ...contents.matchAll(
      /export\s+(?:declare\s+)?(?:const|function|class|type|interface)\s+(\w+)/g
    ),
  ]
    .map((m) => m[1])
    .sort();

  snapshot[`@bickford/${pkg}`] = exports;
}

fs.writeFileSync(
  "EXPORTS_SNAPSHOT.json",
  JSON.stringify(snapshot, null, 2) + "\n"
);

console.log("📦 Export snapshot updated");
