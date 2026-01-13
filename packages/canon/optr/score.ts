import { ExecutionPath } from "./enumerate";
import { Intent } from "../../intent/types";

export function scorePath(path: ExecutionPath, intent: Intent): number {
  // Lower is better
  return (
    (path.estimatedTTV || 0) +
    (path.risk || 0) * 100 -
    Math.log(path.successProbability || 1)
  );
}
