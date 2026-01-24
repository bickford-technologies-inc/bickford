export interface ConversationState {
  conversationId: string;
  sessionId: string;
  turns: ConversationTurn[];
  lastUpdated: number;
}

export interface ConversationTurn {
  turnId: string;
  role: "user" | "assistant";
  content: string;
  ledgerId?: string;
  knowledgeId?: string;
  timestamp: number;
}

export type ConversationRole = "user" | "agent";

export type ConversationMessage = {
  id: string;
  role: ConversationRole;
  content: string;
  timestamp: number;
};

export type ConversationTraceSummary = {
  decision: string;
  canonId: string;
  ledgerId: string;
  ledgerHash: string;
  durationMs: number;
  peakDurationMs: number;
  knowledgeId: string;
  rationale: string;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
  trace?: ConversationTraceSummary | null;
};

export type ConversationSummary = {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  lastMessageAt?: number;
  messageCount: number;
  trace?: ConversationTraceSummary | null;
};

export type ConversationMemoryMatch = {
  conversationId: string;
  conversationTitle: string;
  messageId: string;
  role: ConversationRole;
  content: string;
  timestamp: number;
  score: number;
};

export type ConversationMemoryOptions = {
  limit?: number;
  minScore?: number;
  excludeConversationId?: string;
  includeRoles?: ConversationRole[];
};
