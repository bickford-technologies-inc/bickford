/**
 * Intent → OPTR Wiring
 * TIMESTAMP: 2026-02-08T00:00:00Z
 */

import { Intent } from "../intent/types";
import { enumeratePaths } from "./enumerate";
import { scorePath } from "./score";
import { selectPath } from "./select";

export function runOPTR(intent: Intent) {
  const paths = enumeratePaths(intent).map((p) => ({
    ...p,
    score: scorePath(p, intent),
  }));

  return selectPath(paths);
}
