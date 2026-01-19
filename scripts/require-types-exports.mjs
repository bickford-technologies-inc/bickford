import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("packages/types/package.json", "utf8"));

if (!pkg.exports) {
  console.error("❌ @bickford/types must declare explicit exports");
  process.exit(1);
}

console.log("✅ types export surface enforced");
