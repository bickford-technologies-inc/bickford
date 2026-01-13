import { normalizeIntent } from "../normalize";
import { Intent } from "../types";

// CLI ingestion: parse args or stdin, normalize, and emit Intent
export function ingestFromCLI(args: any): Intent {
  // Example: node cli.js --goal "Fix build" --urgency high
  const goal = args.goal || args._?.[0] || "";
  if (!goal) throw new Error("Goal is required");
  return normalizeIntent({
    goal,
    constraints: args.constraints ? args.constraints.split(",") : [],
    canonRefs: args.canonRefs ? args.canonRefs.split(",") : [],
    urgency: args.urgency,
    source: "human",
  });
}
