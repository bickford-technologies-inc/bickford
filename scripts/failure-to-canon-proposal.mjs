import fs from "fs";

const failureLog = fs.readFileSync("build-failure.log", "utf8");

const signature = failureLog
  .split("\n")
  .find((l) => l.includes("TS230") || l.includes("ERR_PNPM"));

if (!signature) {
  console.log("No promotable failure detected");
  process.exit(0);
}

const proposalsPath = "CANON/proposals.json";
const proposals = fs.existsSync(proposalsPath)
  ? JSON.parse(fs.readFileSync(proposalsPath, "utf8"))
  : [];

const key = signature.includes("TS230")
  ? "types_surface_stability"
  : "pnpm_authority";

proposals.push({
  key,
  confidence: 0.9,
  occurrences: 1,
  evidence: signature,
  timestamp: new Date().toISOString(),
});

fs.writeFileSync(proposalsPath, JSON.stringify(proposals, null, 2));
console.log("🧠 Canon proposal emitted:", key);
