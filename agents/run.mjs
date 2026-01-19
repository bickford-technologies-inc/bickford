import { execSync } from "child_process";

const conflicts = execSync("node agents/detect-conflicts.mjs", {
  encoding: "utf8",
});
process.env.AGENT_CONFLICTS = conflicts;

if (conflicts !== "[]") {
  execSync("node agents/arbitrate.mjs", { stdio: "inherit" });
}

execSync("node agents/run-parallel.mjs", { stdio: "inherit" });
