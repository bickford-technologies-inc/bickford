// app/chat/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AGENT_NAME,
  ARCHIVE_NOTE,
  formatTimestamp,
  loadConversationId,
  persistConversationId,
  type ChatMessage,
  type TraceSummary,
  type TimelineEntry,
} from "../components/chatState";
import styles from "./chat.module.css";

type ConversationSummary = {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  lastMessageAt?: number;
  messageCount: number;
  trace?: TraceSummary | null;
};

type Conversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  trace?: TraceSummary | null;
};

type ChatApiResponse = {
  conversation: Conversation | null;
  timeline: ConversationSummary[];
  transcript?: string;
};

function buildTimeline(summaries: ConversationSummary[]): TimelineEntry[] {
  return summaries.map((summary) => {
    const lastTimestamp =
      summary.lastMessageAt ?? Date.parse(summary.updatedAt) ?? Date.now();
    return {
      id: summary.id,
      label: summary.title || "Untitled",
      summary: summary.preview || "No messages yet",
      timestamp: lastTimestamp,
      trace: summary.trace ?? null,
    };
  });
}

function messagePreview(messages: ChatMessage[]) {
  const firstUser = messages.find((message) => message.role === "user");
  return firstUser?.content?.slice(0, 42) || "Untitled intent";
}

function buildTranscript(messages: ChatMessage[]) {
  return messages
    .map((message) => {
      const roleLabel = message.role === "user" ? "User" : "Agent";
      return `${roleLabel}: ${message.content}`;
    })
    .join("\n");
}

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string | null>(() =>
    loadConversationId(),
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [timeline, setTimeline] = useState<ConversationSummary[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [trace, setTrace] = useState<TraceSummary | null>(null);

  const timelineEntries = useMemo(() => buildTimeline(timeline), [timeline]);

  const applyPayload = useCallback((payload: ChatApiResponse) => {
    setTimeline(payload.timeline ?? []);
    if (payload.conversation) {
      setConversationId(payload.conversation.id);
      persistConversationId(payload.conversation.id);
      setMessages(payload.conversation.messages ?? []);
      setTrace(payload.conversation.trace ?? null);
    } else {
      setMessages([]);
      setTrace(null);
    }
  }, []);

  const fetchConversation = useCallback(
    async (targetId?: string | null) => {
      const query = targetId ? `?conversationId=${targetId}` : "";
      const response = await fetch(`/api/chat${query}`);
      if (!response.ok) {
        return;
      }
      const payload = (await response.json()) as ChatApiResponse;
      applyPayload(payload);
    },
    [applyPayload],
  );

  useEffect(() => {
    void fetchConversation(conversationId);
  }, [conversationId, fetchConversation]);

  const createConversation = useCallback(async () => {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create" }),
    });
    if (!response.ok) {
      return;
    }
    const payload = (await response.json()) as ChatApiResponse;
    applyPayload(payload);
  }, [applyPayload]);

  const selectConversation = useCallback(
    async (id: string) => {
      await fetchConversation(id);
    },
    [fetchConversation],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const now = Date.now();
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: now,
    };

    setIsSending(true);
    setInput("");
    setMessages((current) => [...current, userMessage]);

    try {
      const chatResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: userMessage,
        }),
      });

      if (!chatResponse.ok) {
        throw new Error("Failed to persist message");
      }

      const chatPayload = (await chatResponse.json()) as ChatApiResponse;
      applyPayload(chatPayload);

      const resolvedConversationId =
        chatPayload.conversation?.id ?? conversationId;
      const transcript =
        chatPayload.transcript ??
        (chatPayload.conversation
          ? buildTranscript(chatPayload.conversation.messages)
          : buildTranscript([...messages, userMessage]));

      const executeResponse = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          intent: trimmed,
          origin: "chatdock",
          source: "web",
          sessionId: resolvedConversationId ?? "chatdock",
          transcript,
          metadata: {
            conversationId: resolvedConversationId,
            preview: messagePreview(chatPayload.conversation?.messages ?? []),
          },
        }),
      });

      if (!executeResponse.ok) {
        const errorText = await executeResponse.text();
        throw new Error(errorText || "Execution failed");
      }

      const executePayload = (await executeResponse.json()) as {
        decision: { outcome: string; canonId: string; rationale: string };
        ledgerEntry: { id: string; hash: string };
        knowledge: { entryId: string };
        performance: { durationMs: number; peakDurationMs: number };
      };

      const traceSummary: TraceSummary = {
        decision: executePayload.decision.outcome,
        canonId: executePayload.decision.canonId,
        ledgerId: executePayload.ledgerEntry.id,
        ledgerHash: executePayload.ledgerEntry.hash,
        durationMs: executePayload.performance.durationMs,
        peakDurationMs: executePayload.performance.peakDurationMs,
        knowledgeId: executePayload.knowledge.entryId,
        rationale: executePayload.decision.rationale,
      };

      const agentContent = [
        `Decision: ${executePayload.decision.outcome}`,
        `Canon: ${executePayload.decision.canonId}`,
        `Rationale: ${executePayload.decision.rationale}`,
        `Ledger: ${executePayload.ledgerEntry.id}`,
        `Ledger Hash: ${executePayload.ledgerEntry.hash}`,
        `Knowledge: ${executePayload.knowledge.entryId}`,
        `Duration: ${executePayload.performance.durationMs}ms`,
        `Peak Duration: ${executePayload.performance.peakDurationMs}ms`,
      ].join("\n");

      const agentMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "agent",
        content: agentContent,
        timestamp: now + 1,
      };

      const updateResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: resolvedConversationId,
          message: agentMessage,
          trace: traceSummary,
        }),
      });

      if (updateResponse.ok) {
        const updatedPayload = (await updateResponse.json()) as ChatApiResponse;
        applyPayload(updatedPayload);
      } else {
        setMessages((current) => [...current, agentMessage]);
        setTrace(traceSummary);
      }
    } catch (error) {
      const agentMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "agent",
        content:
          error instanceof Error
            ? `I do not know. Execution failed: ${error.message}`
            : "I do not know. Execution failed.",
        timestamp: now + 1,
      };

      setMessages((current) => [...current, agentMessage]);
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: agentMessage,
        }),
      });
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.logo}>bickford</span>
        </div>
        <button
          className={styles.newChatButton}
          type="button"
          onClick={createConversation}
        >
          <span className={styles.iconCircle}>+</span> New chat
        </button>
        <div className={styles.search}>
          <span className={styles.searchIcon}>⌕</span>
          <input placeholder="Search chats" />
        </div>
        <div className={styles.sidebarSection}>
          <div className={styles.sectionTitle}>Projects</div>
          <div className={styles.timeline}>
            {timelineEntries.length === 0 ? (
              <div className={styles.timelineEmpty}>No decisions yet.</div>
            ) : (
              timelineEntries.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={`${styles.timelineItem} ${
                    conversationId === entry.id ? styles.timelineActive : ""
                  }`}
                  onClick={() => selectConversation(entry.id)}
                >
                  <div className={styles.timelineLabel}>{entry.label}</div>
                  <div className={styles.timelineSummary}>{entry.summary}</div>
                  <div className={styles.timelineMeta}>
                    {formatTimestamp(entry.timestamp)} ·{" "}
                    {entry.trace?.decision ?? "Pending"} · bickford
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <span className={styles.headerBrand}>bickford</span>
          <span className={styles.headerTrace}>Decision Trace Viewer</span>
        </header>

        <div className={styles.chatArea}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <p>What should we do next?</p>
              <span>{ARCHIVE_NOTE}</span>
            </div>
          ) : (
            <div className={styles.thread}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${
                    message.role === "user" ? styles.user : styles.agent
                  }`}
                >
                  <div className={styles.role}>
                    {message.role === "user" ? "You" : AGENT_NAME}
                  </div>
                  <div className={styles.text}>{message.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submit} className={styles.inputRow}>
          <div className={styles.inputShell}>
            <button className={styles.inputIcon} type="button">
              +
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask bickford"
              className={styles.input}
            />
            <button className={styles.inputIcon} type="button">
              🎙
            </button>
          </div>
          <button
            className={styles.sendButton}
            type="submit"
            disabled={isSending || !input.trim()}
          >
            Send
          </button>
        </form>
      </main>
    </section>
  );
}
