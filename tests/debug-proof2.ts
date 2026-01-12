import * as crypto from "crypto";

const proof = {
  "id": "deny_1768251772145_4k3ltrpfb",
  "actionId": "action_001",
  "reasonCodes": [
    "MISSING_CANON_PREREQS"
  ],
  "missingCanonIds": [
    "CANON_MISSING"
  ],
  "violatedInvariantIds": [],
  "requiredCanonRefs": [
    "CANON_A",
    "CANON_MISSING"
  ],
  "message": "Test denial",
  "context": {
    "test": true
  },
  "proofHash": "78617db882ce7f40e220adb53de741ba50eb70dfd596abb452e9326fe5115b8c",
  "createdAt": "2026-01-12T20:00:00.000Z"
};

const proofString = JSON.stringify({
  id: proof.id,
  actionId: proof.actionId,
  ts: proof.createdAt,
  reasonCodes: proof.reasonCodes,
  missingCanonIds: proof.missingCanonIds,
  violatedInvariantIds: proof.violatedInvariantIds,
  message: proof.message,
});

console.log("Proof string:", proofString);

const expectedHash = crypto
  .createHash("sha256")
  .update(proofString)
  .digest("hex");

console.log("Expected hash:", expectedHash);
console.log("Stored hash:  ", proof.proofHash);
console.log("Match:", expectedHash === proof.proofHash);
