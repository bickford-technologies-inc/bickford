import { execSync } from "child_process";

execSync("node agents/run.mjs", { stdio: "inherit" });
execSync("node agents/quorum-resolve.mjs", { stdio: "inherit" });
execSync("node promotions/escalate.mjs", { stdio: "inherit" });
execSync("node trace/assemble-dag.mjs", { stdio: "inherit" });
execSync("node trace/dag.dot.mjs", { stdio: "inherit" });
