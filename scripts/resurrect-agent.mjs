import fs from "fs";

const agent = process.argv[2];
if (!agent) {
  console.error("Usage: resurrect-agent <agent-id>");
  process.exit(1);
}

const trustPath = "CANON/agent-trust.json";
const failuresPath = "CANON/agent-failures.json";

const trust = JSON.parse(fs.readFileSync(trustPath, "utf8"));
const failures = JSON.parse(fs.readFileSync(failuresPath, "utf8"));

trust[agent] = 0.5;

const remaining = failures.filter((f) => f.agent !== agent);

fs.writeFileSync(trustPath, JSON.stringify(trust, null, 2));
fs.writeFileSync(failuresPath, JSON.stringify(remaining, null, 2));

console.log("♻️ Agent resurrected:", agent);
