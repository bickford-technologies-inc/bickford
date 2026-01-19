import fs from "fs";

const dep = JSON.parse(
  fs.readFileSync("packages/types/src/deprecations.json", "utf8"),
);

for (const [sym, meta] of Object.entries(dep)) {
  if (meta.expires === "expired") {
    console.error(`❌ deprecated symbol expired: ${sym}`);
    process.exit(1);
  }
}
console.log("✅ deprecations valid");
