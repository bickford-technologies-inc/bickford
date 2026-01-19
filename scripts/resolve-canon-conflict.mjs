import fs from "fs";

const base = JSON.parse(fs.readFileSync("CANON/canon.json", "utf8"));
const incoming = JSON.parse(
  fs.readFileSync("CANON/incoming-canon.json", "utf8"),
);

const resolved = { ...base };

for (const [key, val] of Object.entries(incoming.runtime)) {
  if (key in base.runtime && base.runtime[key] !== val) {
    resolved.runtime[key] = base.runtime[key];
    console.log("CONFLICT RESOLVED (kept base):", key);
  } else {
    resolved.runtime[key] = val;
  }
}

resolved.meta.version = base.meta.version + "+resolved";
resolved.meta.timestamp = new Date().toISOString();

fs.writeFileSync("CANON/canon.json", JSON.stringify(resolved, null, 2));
console.log("🧩 Canon conflict resolved");
