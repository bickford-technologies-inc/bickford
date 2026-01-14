import fs from "node:fs";
import path from "node:path";

const packagesDir = path.resolve("packages");
let failed = false;

for (const pkg of fs.readdirSync(packagesDir)) {
  const pkgPath = path.join(packagesDir, pkg);
  const dist = path.join(pkgPath, "dist");
  if (!fs.existsSync(dist)) continue;

  const js = fs.readFileSync(path.join(dist, "index.js"), "utf8");
  const dts = fs.readFileSync(path.join(dist, "index.d.ts"), "utf8");

  const jsExports = [
    ...js.matchAll(/export\s+(?:const|function|class)\s+(\w+)/g),
  ].map((m) => m[1]);
  const dtsExports = [
    ...dts.matchAll(
      /export\s+(?:declare\s+)?(?:const|function|class)\s+(\w+)/g
    ),
  ].map((m) => m[1]);

  for (const symbol of jsExports) {
    if (!dtsExports.includes(symbol)) {
      console.error(
        `❌ Export parity violation in @bickford/${pkg}: ${symbol}`
      );
      failed = true;
    }
  }
}

if (failed) process.exit(1);
console.log("✅ Export parity verified");
