import {
  createDeniedDecisionProof,
  verifyDeniedDecisionProof,
} from "../packages/bickford/api/whynot-panel";

import { DenialReasonCode } from "../packages/bickford/src/canon/types";

const denyTrace = {
  ts: "2026-01-12T20:00:00.000Z",
  actionId: "action_001",
  denied: true as const,
  reasonCodes: [DenialReasonCode.MISSING_CANON_PREREQS],
  missingCanonIds: ["CANON_MISSING"],
  requiredCanonRefs: ["CANON_A", "CANON_MISSING"],
  message: "Test denial",
  context: { test: true },
};

const proof = createDeniedDecisionProof(denyTrace);
console.log("Proof:", JSON.stringify(proof, null, 2));

const verification = verifyDeniedDecisionProof(proof);
console.log("Verification:", verification);
