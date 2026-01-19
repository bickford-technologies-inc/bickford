import { execSync } from "child_process";

execSync("node agents/run.mjs", { stdio: "inherit" });
execSync("node agents/promote-with-rollback.mjs", { stdio: "inherit" });
execSync("node trace/assemble-dag.mjs", { stdio: "inherit" });
execSync("node trace/dag.dot.mjs", { stdio: "inherit" });
execSync("node trace/render-svg.mjs", { stdio: "inherit" });
