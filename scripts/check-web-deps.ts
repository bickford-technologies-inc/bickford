import fs from "fs";
import path from "path";

const webPkgPath = path.join("apps", "web", "package.json");
const webPkg = JSON.parse(fs.readFileSync(webPkgPath, "utf-8"));

const REQUIRED = [
  "@bickford/ledger",
  "@bickford/canon",
  "@bickford/optr",
  "@bickford/authority",
  "@bickford/types",
  "@bickford/core"
];

const deps = webPkg.dependencies ?? {};
const missing = REQUIRED.filter(d => !deps[d]);

if (missing.length) {
  console.error("❌ Web dependency invariant violated.");
  missing.forEach(d => console.error(`   Missing: ${d}`));
  process.exit(1);
}

console.log("✅ Web dependency invariant satisfied.");
