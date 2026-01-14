import fs from "node:fs";

const prev = JSON.parse(fs.readFileSync("EXPORTS_SNAPSHOT.json", "utf8"));
const next = JSON.parse(fs.readFileSync("EXPORTS_SNAPSHOT.next.json", "utf8"));

let failed = false;

for (const pkg in next) {
  const a = prev[pkg] || [];
  const b = next[pkg] || [];

  if (JSON.stringify(a) !== JSON.stringify(b)) {
    console.error(`❌ Export drift detected in ${pkg}`);
    console.error("Before:", a);
    console.error("After :", b);
    failed = true;
  }
}

if (failed) process.exit(1);
console.log("✅ No export drift detected");
