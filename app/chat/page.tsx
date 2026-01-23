// app/chat/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AGENT_NAME,
  ARCHIVE_NOTE,
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
    const fallbackTimestamp = Date.parse(summary.updatedAt);
    return {
      id: summary.id,
      label: summary.title,
      summary: summary.preview,
      timestamp: summary.lastMessageAt ?? fallbackTimestamp,
      trace: summary.trace ?? null,
    };
  });
}

function messagePreview(messages: ChatMessage[]) {
  const firstUser = messages.find((message) => message.role === "user");
  return firstUser?.content?.slice(0, 42) || "Untitled intent";
}

function buildAgentReply(intent: string) {
  const normalized = intent.trim().toLowerCase();
  const cleaned = normalized.replace(/[^a-z0-9\s]/g, "").trim();
  const firstWord = cleaned.split(/\s+/)[0];

  if (firstWord && GREETINGS.has(firstWord)) {
    return RESPONSE_CONFIG.greetingReply;
  }

  if (normalized.endsWith("?")) {
    return RESPONSE_CONFIG.questionReply;
  }

  return RESPONSE_CONFIG.defaultReply;
}

function buildTranscript(messages: ChatMessage[]) {
  return messages
    .map((message) => {
      const roleLabel = message.role === "user" ? "User" : "Agent";
      return `${roleLabel}: ${message.content}`;
    })
    .join("\n");
}

const GREETINGS = new Set([
  "hello",
  "hi",
  "hey",
  "greetings",
  "howdy",
  "yo",
  "sup",
]);

const RESPONSE_CONFIG = {
  greetingReply: "Hello! How can I help you today?",
  questionReply: "That's a great question! Let me think...",
  defaultReply: "I'm here to help. What would you like to do next?",
};

function formatTimestamp(ts: number | string): string {
  const date = new Date(typeof ts === "string" ? parseInt(ts, 10) : ts);
  return date.toLocaleString(undefined, {
    year: "2-digit",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isRetrying, setIsRetrying] = useState(false);
  const [persistenceError, setPersistenceError] = useState<{
    title: string;
    detail: string;
    retryLabel: string;
    action: () => Promise<void>;
  } | null>(null);

  const timelineEntries = useMemo(() => buildTimeline(timeline), [timeline]);
  const filteredTimelineEntries = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return timelineEntries;
    return timelineEntries.filter((entry) => {
      return (
        entry.label.toLowerCase().includes(term) ||
        entry.summary.toLowerCase().includes(term)
      );
    });
  }, [searchTerm, timelineEntries]);

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

  const persistChatUpdate = useCallback(
    async ({
      targetConversationId,
      message,
      traceSummary,
    }: {
      targetConversationId?: string | null;
      message: ChatMessage;
      traceSummary?: TraceSummary | null;
    }) => {
      let response: Response;
      try {
        response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: targetConversationId,
            message,
            trace: traceSummary,
          }),
        });
      } catch (error) {
        const networkError = new Error("Failed to persist conversation update");
        networkError.name = "ChatPersistenceError";
        throw networkError;
      }

      if (!response.ok) {
        const errorText = await response.text();
        const persistError = new Error(
          errorText || "Failed to persist conversation update",
        );
        persistError.name = "ChatPersistenceError";
        throw persistError;
      }

      const payload = (await response.json()) as ChatApiResponse;
      applyPayload(payload);
      return payload;
    },
    [applyPayload],
  );

  const handleRetry = useCallback(async () => {
    if (!persistenceError) return;
    setIsRetrying(true);
    try {
      await persistenceError.action();
      setPersistenceError(null);
    } catch (error) {
      setPersistenceError((current) =>
        current
          ? {
              ...current,
              detail: `${current.detail} Retry failed.`,
            }
          : null,
      );
    } finally {
      setIsRetrying(false);
    }
  }, [persistenceError]);

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
    setPersistenceError(null);
    setMessages((current) => [...current, userMessage]);

    try {
      const chatPayload = await persistChatUpdate({
        targetConversationId: conversationId,
        message: userMessage,
      });

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
        content: buildAgentReply(trimmed),
        timestamp: now + 1,
      };

      try {
        await persistChatUpdate({
          targetConversationId: resolvedConversationId,
          message: agentMessage,
          traceSummary,
        });
      } catch (error) {
        setMessages((current) => [...current, agentMessage]);
        setTrace(traceSummary);
        setPersistenceError({
          title: "Agent reply not saved",
          detail:
            "We couldn't persist the trace update. Retry to save the decision context.",
          retryLabel: "Retry save reply",
          action: async () => {
            await persistChatUpdate({
              targetConversationId: resolvedConversationId,
              message: agentMessage,
              traceSummary,
            });
          },
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === "ChatPersistenceError") {
        setPersistenceError({
          title: "Message not saved",
          detail:
            "We couldn't persist this message to the timeline. Retry to save it before executing.",
          retryLabel: "Retry save",
          action: async () => {
            const chatPayload = await persistChatUpdate({
              targetConversationId: conversationId,
              message: userMessage,
            });
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
                  preview: messagePreview(
                    chatPayload.conversation?.messages ?? [],
                  ),
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
              `Knowledge: ${executePayload.knowledge.entryId}`,
            ].join("\n");

            const agentMessage: ChatMessage = {
              id: crypto.randomUUID(),
              role: "agent",
              content: agentContent,
              timestamp: now + 1,
            };

            await persistChatUpdate({
              targetConversationId: resolvedConversationId,
              message: agentMessage,
              traceSummary,
            });
          },
        });
        return;
      }

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
          <input
            placeholder="Search chats"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className={styles.sidebarSection}>
          <div className={styles.sectionTitle}>Projects</div>
          <div className={styles.timeline}>
            {timelineEntries.length === 0 ? (
              <div className={styles.timelineEmpty}>No decisions yet.</div>
            ) : filteredTimelineEntries.length === 0 ? (
              <div className={styles.timelineEmpty}>No matching chats.</div>
            ) : (
              filteredTimelineEntries.map((entry) => (
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
              {persistenceError ? (
                <div className={styles.errorBanner}>
                  <div>
                    <strong>{persistenceError.title}</strong>
                    <p>{persistenceError.detail}</p>
                  </div>
                  <button
                    className={styles.retryButton}
                    type="button"
                    onClick={handleRetry}
                    disabled={isRetrying}
                  >
                    {isRetrying ? "Retrying..." : persistenceError.retryLabel}
                  </button>
                </div>
              ) : null}
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

      <aside className={styles.trace}>
        <div className={styles.traceHeader}>Trace Context</div>
        {trace ? (
          <div className={styles.traceBody}>
            <div className={styles.traceItem}>
              <strong>Decision</strong>
              <span>{trace.decision}</span>
            </div>
            <div className={styles.traceItem}>
              <strong>Canon ID</strong>
              <span>{trace.canonId}</span>
            </div>
            <div className={styles.traceItem}>
              <strong>Ledger</strong>
              <span>{trace.ledgerId}</span>
              <span className={styles.traceMeta}>{trace.ledgerHash}</span>
            </div>
            <div className={styles.traceItem}>
              <strong>Knowledge Entry</strong>
              <span>{trace.knowledgeId}</span>
            </div>
            <div className={styles.traceItem}>
              <strong>Runtime</strong>
              <span>
                {trace.durationMs}ms · peak {trace.peakDurationMs}ms
              </span>
            </div>
            <details className={styles.traceDetails}>
              <summary>Decision rationale</summary>
              <p>{trace.rationale}</p>
            </details>
          </div>
        ) : (
          <div className={styles.traceEmpty}>
            No trace metadata yet. Execute a decision to populate the ledger
            context.
          </div>
        )}
      </aside>
    </section>
  );
}
