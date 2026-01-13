// Wire OPTR to intent ingestion and canon enforcement
import { Intent } from "../intent/types";
import { enumeratePaths } from "./enumerate";
import { scorePath } from "./score";
import { selectPath } from "./select";
import { executeWithCanon } from "../canon/execution";
import { requireCanonRefs } from "../canon/invariants";
import { persistDeniedDecision } from "../canon/denials/persistDeniedDecision";

export async function processIntent(intent: Intent) {
  // 1. Enumerate paths
  const paths = enumeratePaths(intent);
  // 2. Score each path
  for (const path of paths) {
    path.score = scorePath(path, intent);
  }
  // 3. Select best path
  const chosen = selectPath(paths);
  // 4. Canon enforcement
  const context = {
    mode: "live",
    canonRefsAvailable: intent.canonRefs,
    timestamp: intent.createdAt,
  };
  const result = executeWithCanon(
    {
      id: intent.id,
      prerequisitesCanonIds: intent.canonRefs,
      // ...other Action fields as needed
    },
    context
  );
  if (!result.allowed && result.denyTrace) {
    await persistDeniedDecision({
      ts: result.denyTrace.ts,
      actionId: result.denyTrace.actionId,
      reasonCodes: result.denyTrace.reasonCodes,
      message: result.denyTrace.message,
      tenantId: "default",
      // ...other DeniedDecisionPayload fields as needed
    });
  }
  return { intent, paths, chosen, result };
}
