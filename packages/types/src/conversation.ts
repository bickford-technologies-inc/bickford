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
