import fs from "fs";

const trust = JSON.parse(fs.readFileSync("CANON/agent-trust.json", "utf8"));
const failures = JSON.parse(
  fs.readFileSync("CANON/agent-failures.json", "utf8"),
);
const policy = JSON.parse(fs.readFileSync("CANON/agent-policy.json", "utf8"));

const counts = {};
for (const f of failures) {
  counts[f.agent] = (counts[f.agent] || 0) + 1;
}

for (const agent of Object.keys(trust)) {
  if (
    trust[agent] < policy.trust_floor ||
    (counts[agent] || 0) >= policy.evict_after
  ) {
    console.log("EVICTED:", agent);
    trust[agent] = 0;
  }
}

fs.writeFileSync("CANON/agent-trust.json", JSON.stringify(trust, null, 2));
