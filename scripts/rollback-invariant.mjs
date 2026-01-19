import fs from "fs";

const canonPath = "CANON/canon.json";
const key = process.argv[2];

if (!key) {
  console.error("Usage: rollback-invariant <key>");
  process.exit(1);
}

const canon = JSON.parse(fs.readFileSync(canonPath, "utf8"));

delete canon.runtime[key];

canon.meta.version = canon.meta.version + "-rollback";
canon.meta.timestamp = new Date().toISOString();

fs.writeFileSync(canonPath, JSON.stringify(canon, null, 2));

console.log("↩️ Rolled back invariant:", key);
