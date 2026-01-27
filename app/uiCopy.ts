// Canonical Bickford voice for trace, audit, and proof
export const bickfordVoice = {
  allowed: (policy: string, hash: string) =>
    `Decision: ALLOWED\nPolicy: ${policy}\nRoot Hash: ${hash}`,
  denied: (rule: string, reason: string) =>
    `Decision: DENIED\nRule: ${rule}\nReason: ${reason}`,
  error: (invariant: string, hash: string) =>
    `Execution halted. Invariant violation detected.\nInvariant: ${invariant}\nInput hash: ${hash}`,
  closing: "Decision recorded.\nProof available.",
};

// Conversational, clear, and professional voice for general UI
export const appVoice = {
  welcome:
    "Welcome to Bickford Chat. Ask anything, and see how decisions are made.",
  promptPlaceholder: "Type your question here...",
  help: "Need help? Click the info icon for a walkthrough.",
  emptyState:
    "No messages yet. Start a conversation to see Bickford in action.",
  loading: "Loading...",
  error: "Something went wrong. Please try again or contact support.",
};
