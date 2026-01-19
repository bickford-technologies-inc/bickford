import fs from "fs";

const schema = JSON.parse(fs.readFileSync("agents/quorum.schema.json", "utf8"));
const votes = JSON.parse(fs.readFileSync(schema.votesFile, "utf8"));

const approvals = Object.values(votes).filter((v) => v === "approve").length;
const rejections = Object.values(votes).filter((v) => v === "reject").length;

if (rejections > 0) {
  throw new Error("❌ quorum rejected");
}

if (approvals >= schema.required) {
  console.log("✅ quorum approved");
  process.exit(0);
}

throw new Error("⏳ quorum incomplete");
