import fs from "fs";

const rules = JSON.parse(
  fs.readFileSync("agents/arbitration.rules.json", "utf8"),
);
const lockPath = rules.lockFile;

const conflicts = JSON.parse(process.env.AGENT_CONFLICTS || "[]");

if (conflicts.length === 0) process.exit(0);

for (const pkg of rules.priority) {
  if (conflicts.includes(pkg)) {
    fs.writeFileSync(
      lockPath,
      JSON.stringify({ owner: pkg, ts: Date.now() }, null, 2),
    );
    console.log("🔒 arbitration winner:", pkg);
    process.exit(0);
  }
}

throw new Error("No arbitration winner found");
