import fs from "node:fs";

const now = Date.now();
const deprecations = JSON.parse(
  fs.readFileSync("CANON/deprecations.json", "utf8"),
);

let failed = false;

for (const d of deprecations) {
  const end = new Date(d.grace_until).getTime();
  if (now > end) {
    console.error(`❌ DEPRECATION EXPIRED: ${d.symbol}`);
    console.error(`   replace with: ${d.replacement}`);
    failed = true;
  } else {
    console.log(`⚠️ deprecated: ${d.symbol} (grace until ${d.grace_until})`);
  }
}

if (failed) process.exit(1);
console.log("✅ deprecations within grace");
