// app/chat/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AGENT_NAME,
  ARCHIVE_NOTE,
  hydrateChatState,
  msUntilNextMidnight,
  persistChatState,
  reconcileDaily,
  type ChatMessage,
  type ChatState,
} from "../components/chatState";
import styles from "./chat.module.css";

type TraceSummary = {
  decision: string;
  canonId: string;
  ledgerId: string;
  ledgerHash: string;
  durationMs: number;
  peakDurationMs: number;
  knowledgeId: string;
  rationale: string;
};

type TimelineEntry = {
  id: string;
  label: string;
  summary: string;
  timestamp: number;
};

const RESPONSE_CONFIG = {
  version: "v2",
  greetings: ["hello", "hey", "hi", "hiya", "sup", "yo"],
  greetingReply: "Hi. What are we building today?",
  questionReply: "Acknowledged. I will log that. What should we do next?",
  defaultReply: "Acknowledged. Intent recorded. What should we do next?",
};
const GREETINGS = new Set(RESPONSE_CONFIG.greetings);

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

function buildTimeline(state: ChatState): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  if (state.messages.length > 0) {
    const latestTimestamp =
      state.messages[state.messages.length - 1]?.timestamp ?? Date.now();
    entries.push({
      id: "today",
      label: "Today",
      summary: messagePreview(state.messages),
      timestamp: latestTimestamp,
    });
  }

  for (const archive of state.archives) {
    const latestTimestamp =
      archive.messages[archive.messages.length - 1]?.timestamp ?? Date.now();
    entries.push({
      id: archive.date,
      label: archive.date,
      summary: messagePreview(archive.messages),
      timestamp: latestTimestamp,
    });
  }

  return entries;
}

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ChatPage() {
  const [state, setState] = useState<ChatState>(() => hydrateChatState());
  const [selectedThread, setSelectedThread] = useState<string>("today");
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [trace, setTrace] = useState<TraceSummary | null>(null);

  useEffect(() => {
    persistChatState(state);
  }, [state]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setState((current) => reconcileDaily(current));
      setSelectedThread("today");
    }, msUntilNextMidnight());
    return () => window.clearTimeout(timeout);
  }, [state.currentDate]);

  const timeline = useMemo(() => buildTimeline(state), [state]);

  const activeMessages = useMemo(() => {
    if (selectedThread === "today") return state.messages;
    const archive = state.archives.find((entry) => entry.date === selectedThread);
    return archive?.messages ?? state.messages;
  }, [selectedThread, state.archives, state.messages]);

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

    try {
      const [executeResponse] = await Promise.all([
        fetch("/api/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: trimmed,
            origin: "chatdock",
            source: "web",
            sessionId: state.currentDate,
            configOverrides: {
              responseConfig: RESPONSE_CONFIG,
            },
          }),
        }),
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            intent: trimmed,
            origin: "chatdock",
            sessionId: state.currentDate,
          }),
        }),
      ]);

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

      const agentMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "agent",
        content: buildAgentReply(trimmed),
        timestamp: now + 1,
      };

      setTrace({
        decision: executePayload.decision.outcome,
        canonId: executePayload.decision.canonId,
        ledgerId: executePayload.ledgerEntry.id,
        ledgerHash: executePayload.ledgerEntry.hash,
        durationMs: executePayload.performance.durationMs,
        peakDurationMs: executePayload.performance.peakDurationMs,
        knowledgeId: executePayload.knowledge.entryId,
        rationale: executePayload.decision.rationale,
      });

      setState((current) => ({
        ...current,
        messages: [...current.messages, userMessage, agentMessage],
      }));
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

      setState((current) => ({
        ...current,
        messages: [...current.messages, userMessage, agentMessage],
      }));
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
        <button className={styles.newChatButton} type="button">
          <span className={styles.iconCircle}>+</span> New chat
        </button>
        <div className={styles.search}>
          <span className={styles.searchIcon}>⌕</span>
          <input placeholder="Search chats" />
        </div>
        <div className={styles.sidebarSection}>
          <div className={styles.sectionTitle}>Projects</div>
          <div className={styles.timeline}>
            {timeline.length === 0 ? (
              <div className={styles.timelineEmpty}>No decisions yet.</div>
            ) : (
              timeline.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  className={`${styles.timelineItem} ${
                    selectedThread === entry.id ? styles.timelineActive : ""
                  }`}
                  onClick={() => setSelectedThread(entry.id)}
                >
                  <div className={styles.timelineLabel}>{entry.label}</div>
                  <div className={styles.timelineSummary}>{entry.summary}</div>
                  <div className={styles.timelineMeta}>
                    {formatTimestamp(entry.timestamp)} · bickford
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
          {activeMessages.length === 0 ? (
            <div className={styles.emptyState}>
              <p>What should we do next?</p>
              <span>{ARCHIVE_NOTE}</span>
            </div>
          ) : (
            <div className={styles.thread}>
              {activeMessages.map((message) => (
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
            <button
              className={styles.sendButton}
              type="submit"
              disabled={isSending}
            >
              ⦿
            </button>
          </div>
        </form>
      </main>

      <aside className={styles.trace}>
        <div className={styles.traceHeader}>Decision Trace Viewer</div>
        {trace ? (
          <div className={styles.traceBody}>
            <div className={styles.traceItem}>
              <span>Decision</span>
              <strong>{trace.decision}</strong>
            </div>
            <div className={styles.traceItem}>
              <span>Canon</span>
              <strong>{trace.canonId}</strong>
            </div>
            <div className={styles.traceItem}>
              <span>Ledger</span>
              <strong>{trace.ledgerId}</strong>
            </div>
            <div className={styles.traceItem}>
              <span>Hash</span>
              <strong>{trace.ledgerHash.slice(0, 16)}...</strong>
            </div>
            <div className={styles.traceItem}>
              <span>Knowledge</span>
              <strong>{trace.knowledgeId}</strong>
            </div>
            <div className={styles.traceItem}>
              <span>Runtime</span>
              <strong>
                {trace.durationMs}ms (peak {trace.peakDurationMs}ms)
              </strong>
            </div>
            <div className={styles.traceNote}>{trace.rationale}</div>
          </div>
        ) : (
          <div className={styles.traceEmpty}>
            No trace yet. Execute an intent to reveal the ledger.
          </div>
        )}
      </aside>
    </section>
  );
}
