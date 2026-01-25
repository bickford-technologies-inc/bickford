import { createHash } from "crypto";

// Minimal stub for canon module
export const CANON = {
  allowedModels: ["claude-sonnet-4-5"],
  maxTokensPerRequest: 4096,
  constitutionalConstraints: {
    noHarmfulContent: true,
    noPersonalData: true,
  },
  requireAuditTrail: true,
};

// In-memory ledger for test purposes
const ledger = [];

export function bufferTokensWithProof({
  tokens = [1, 2],
  approved = true,
  timestamp = Date.now(),
} = {}) {
  const proofHash = createHash("sha256")
    .update(JSON.stringify({ tokens, approved, timestamp }))
    .digest("hex");
  const entry = {
    type: "token_stream",
    tokens,
    approved,
    timestamp,
    proofHash,
  };
  ledger.push(entry);
  return {
    approved,
    tokens,
    proofHash,
    timestamp,
  };
}

export function verifyTokenStreamProof(proof, ledgerState) {
  if (!proof || !proof.proofHash) return { valid: false };
  // Find matching ledger entry
  const entry = ledger.find(
    (e) => e.type === "token_stream" && e.proofHash === proof.proofHash,
  );
  if (!entry) return { valid: false };
  // If ledgerState is provided, check it matches entry
  if (ledgerState && JSON.stringify(ledgerState) !== JSON.stringify(entry.ledgerState)) {
    return { valid: false };
  }
  const expectedHash = createHash("sha256")
    .update(JSON.stringify({ tokens: entry.tokens, approved: entry.approved, timestamp: entry.timestamp }))
    .digest("hex");
  return { valid: proof.proofHash === expectedHash };
}

export function createExecutionContext({
  input = "default",
  timestamp = Date.now(),
} = {}) {
  const contextHash = createHash("sha256")
    .update(input + timestamp)
    .digest("hex");
  return { contextHash };
}

export function finalizeChatItem({
  canonRefs = ["CANON_A"],
  timestamp = Date.now(),
} = {}) {
  const hash = createHash("sha256")
    .update(JSON.stringify({ canonRefs, timestamp }))
    .digest("hex");
  return { finalized: true, hash };
}

export function sealChatItem({
  itemId = "msg_001",
  timestamp = Date.now(),
} = {}) {
  const hash = createHash("sha256")
    .update(itemId + timestamp)
    .digest("hex");
  return { sealedAt: new Date(timestamp), hash };
}

// Ledger access for test integration
export function _getLedger() {
  return ledger;
}
export function _resetLedger() {
  ledger.length = 0;
}
