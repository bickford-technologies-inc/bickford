import fs from "fs";

const schema = JSON.parse(fs.readFileSync("agents/quorum.schema.json", "utf8"));
const votesPath = schema.votesFile;

const agent = process.env.AGENT_NAME;
const vote = process.env.AGENT_VOTE; // approve | reject

if (!agent || !vote) {
  throw new Error("AGENT_NAME and AGENT_VOTE required");
}

const votes = fs.existsSync(votesPath)
  ? JSON.parse(fs.readFileSync(votesPath, "utf8"))
  : {};

votes[agent] = vote;

fs.writeFileSync(votesPath, JSON.stringify(votes, null, 2));
console.log("🗳️ vote recorded:", agent, vote);
