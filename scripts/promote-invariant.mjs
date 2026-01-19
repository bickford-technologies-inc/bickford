import fs from "fs";

const canonPath = "CANON/canon.json";
const proposalsPath = "CANON/proposals.json";

const canon = JSON.parse(fs.readFileSync(canonPath, "utf8"));
const proposals = JSON.parse(fs.readFileSync(proposalsPath, "utf8"));

let promoted = false;

for (const p of proposals) {
  if (p.confidence >= 0.85 && p.occurrences >= 2) {
    canon.runtime[p.key] = true;
    promoted = true;
    console.log("PROMOTED:", p.key);
  }
}

if (promoted) {
  const [major, minor, patch] = canon.meta.version.split(".").map(Number);
  canon.meta.version = `${major}.${minor}.${patch + 1}`;
  canon.meta.timestamp = new Date().toISOString();

  fs.writeFileSync(canonPath, JSON.stringify(canon, null, 2));
}
