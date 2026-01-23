export type ChatRole = "user" | "agent";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
};

export type TraceSummary = {
  decision: string;
  canonId: string;
  ledgerId: string;
  ledgerHash: string;
  durationMs: number;
  peakDurationMs: number;
  knowledgeId: string;
  rationale: string;
};

export type TimelineEntry = {
  id: string;
  label: string;
  summary: string;
  timestamp: number;
  trace: TraceSummary | null;
};

export const AGENT_NAME = "bickford";
export const ARCHIVE_NOTE =
  "single agent for the full environment • archives chat history daily at local midnight";

export const CHAT_CONVERSATION_KEY = "bickford.chat.active.v1";

export function loadConversationId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CHAT_CONVERSATION_KEY);
}

export function persistConversationId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) {
    localStorage.setItem(CHAT_CONVERSATION_KEY, id);
  } else {
    localStorage.removeItem(CHAT_CONVERSATION_KEY);
  }
}

export function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
