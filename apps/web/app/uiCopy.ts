// uiCopy.ts
// Centralized voice system for Bickford UI

export const bickfordVoice = {
  processing: "Collecting parallel proposals…",
  evaluating: "Evaluating admissibility…",
  resolving: "Resolving optimal path…",
  allowed: ({
    policy,
    score,
    hash,
  }: {
    policy: string;
    score: string;
    hash: string;
  }) =>
    `Decision: ALLOWED\nPolicy: ${policy}\nOPTR Score: ${score}\nRoot Hash: ${hash}`,
  denied: ({ violation, rule }: { violation: string; rule: string }) =>
    `Decision: DENIED\nViolation: ${violation}\nRule: ${rule}\nModel proposal discarded.`,
  verified: "Cryptographically verified. Proof complete.",
  canonicalClosing: "Decision recorded.\nProof available.",
  status: (status: string) => `Status: ${status}`,
  error: (invariant: string, hash: string, action: string) =>
    `Execution halted. Invariant violation detected.\nInvariant: ${invariant}\nInput hash: ${hash}\nNext admissible action: ${action}`,
};

export const appVoice = {
  welcome:
    "Welcome to Bickford Chat. Ask anything, and see how decisions are made.",
  compare: "Compare traditional AI with Bickford's provable decisions.",
  loading: "Loading…",
  empty: "No messages yet. Start the conversation!",
  error: "Something went wrong. Please try again.",
  missing: (items: string[]) =>
    `Missing: ${items.map((i) => `• ${i}`).join(" ")}`,
  prompt: "Ask Bickford or try an example:",
  button: "Send",
  nav: {
    chat: "Chat",
    trace: "Decision Trace Viewer",
    dag: "Canon DAG",
    platform: "Platform",
  },
};

export function getVoice(type: "bickford" | "app") {
  return type === "bickford" ? bickfordVoice : appVoice;
}
