import fs from "fs";

const trustPath = "CANON/agent-trust.json";
const failures = JSON.parse(
  fs.readFileSync("CANON/agent-failures.json", "utf8"),
);

const trust = JSON.parse(fs.readFileSync(trustPath, "utf8"));

for (const f of failures) {
  trust[f.agent] = Math.max(0, trust[f.agent] - 0.1);
}

fs.writeFileSync(trustPath, JSON.stringify(trust, null, 2));
