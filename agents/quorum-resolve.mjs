import fs from "fs";

const schema = JSON.parse(fs.readFileSync("agents/quorum.schema.json", "utf8"));
const votes = JSON.parse(fs.readFileSync(schema.votesFile, "utf8"));

let approveWeight = 0;
let rejectWeight = 0;

for (const [agent, vote] of Object.entries(votes)) {
  const weight = schema.agents[agent] ?? 1;
  if (vote === "approve") approveWeight += weight;
  if (vote === "reject") rejectWeight += weight;
}

if (rejectWeight > 0) {
  throw new Error("❌ quorum rejected (weighted)");
}

if (approveWeight >= schema.requiredWeight) {
  console.log("✅ quorum approved (weight =", approveWeight, ")");
  process.exit(0);
}

throw new Error("⏳ quorum incomplete");
