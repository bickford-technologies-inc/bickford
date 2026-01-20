"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ChatRole = "user" | "agent";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
};

type DailyArchive = {
  date: string;
  messages: ChatMessage[];
};

type ChatState = {
  currentDate: string;
  messages: ChatMessage[];
  archives: DailyArchive[];
};

const STORAGE_KEY = "bickford.chat.unified.v1";
const LEGACY_DAILY_KEY = "bickford.chat.daily.v1";
const LEGACY_HISTORY_KEY = "bickford.chat.history";
const LEGACY_HISTORY_DAY_KEY = "bickford.chat.history.day";
const LEGACY_ARCHIVE_KEY = "bickford.chat.archive";
const AGENT_NAME = "bickford";
const ARCHIVE_NOTE =
  "single agent for the full environment • archives daily at local midnight";

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayKey() {
  return formatLocalDate(new Date());
}

function utcKey(date: Date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function utcDateKeyToLocal(dateKey: string) {
  const parsed = new Date(`${dateKey}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return dateKey;
  }
  return formatLocalDate(parsed);
}

function migrateUtcDates(state: ChatState): ChatState {
  const localToday = todayKey();
  const utcToday = utcKey();
  if (state.currentDate !== utcToday || state.currentDate === localToday) {
    return state;
  }
  return {
    ...state,
    currentDate: utcDateKeyToLocal(state.currentDate),
    archives: state.archives.map((archive) => ({
      ...archive,
      date: utcDateKeyToLocal(archive.date),
    })),
  };
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function normalizeMessages(
  messages: Array<{
    id?: string;
    role?: string;
    content?: string;
    text?: string;
    author?: string;
    timestamp?: number | string;
  }>,
): ChatMessage[] {
  return messages
    .filter((message) => message)
    .map((message) => {
      const role = message.role ?? message.author ?? "agent";
      return {
        id: message.id ?? crypto.randomUUID(),
        role: role === "user" ? "user" : "agent",
        content: message.content ?? message.text ?? "",
        timestamp:
          typeof message.timestamp === "number"
            ? message.timestamp
            : Number.isFinite(Date.parse(String(message.timestamp)))
              ? Date.parse(String(message.timestamp))
              : Date.now(),
      };
    })
    .filter((message) => message.content.trim().length > 0);
}

function hydrateState(): ChatState {
  if (typeof window === "undefined") {
    return { currentDate: todayKey(), messages: [], archives: [] };
  }

  const stored = safeParse<ChatState>(localStorage.getItem(STORAGE_KEY));
  if (stored) {
    return migrateUtcDates({
      currentDate: stored.currentDate ?? todayKey(),
      messages: Array.isArray(stored.messages)
        ? normalizeMessages(stored.messages)
        : [],
      archives: Array.isArray(stored.archives)
        ? stored.archives.map((archive) => ({
            date: archive.date,
            messages: normalizeMessages(archive.messages ?? []),
          }))
        : [],
    });
  }

  const legacyDaily = safeParse<ChatState>(
    localStorage.getItem(LEGACY_DAILY_KEY),
  );
  if (legacyDaily) {
    return migrateUtcDates({
      currentDate: legacyDaily.currentDate ?? todayKey(),
      messages: Array.isArray(legacyDaily.messages)
        ? normalizeMessages(legacyDaily.messages)
        : [],
      archives: Array.isArray(legacyDaily.archives)
        ? legacyDaily.archives.map((archive) => ({
            date: archive.date,
            messages: normalizeMessages(archive.messages ?? []),
          }))
        : [],
    });
  }

  const legacyMessages = safeParse<ChatMessage[]>(
    localStorage.getItem(LEGACY_HISTORY_KEY),
  );
  const legacyArchives = safeParse<DailyArchive[]>(
    localStorage.getItem(LEGACY_ARCHIVE_KEY),
  );
  const legacyDay = localStorage.getItem(LEGACY_HISTORY_DAY_KEY);

  return migrateUtcDates({
    currentDate: legacyDay ?? todayKey(),
    messages: Array.isArray(legacyMessages)
      ? normalizeMessages(legacyMessages)
      : [],
    archives: Array.isArray(legacyArchives)
      ? legacyArchives.map((archive) => ({
          date: archive.date,
          messages: normalizeMessages(archive.messages ?? []),
        }))
      : [],
  });
}

function reconcileDaily(state: ChatState): ChatState {
  const today = todayKey();
  if (state.currentDate === today) {
    return state;
  }

  const archives = [...state.archives];
  if (state.messages.length > 0) {
    archives.unshift({ date: state.currentDate, messages: state.messages });
  }

  return {
    currentDate: today,
    messages: [],
    archives,
  };
}

function persistState(state: ChatState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.removeItem(LEGACY_DAILY_KEY);
  localStorage.removeItem(LEGACY_HISTORY_KEY);
  localStorage.removeItem(LEGACY_HISTORY_DAY_KEY);
  localStorage.removeItem(LEGACY_ARCHIVE_KEY);
}

function msUntilNextMidnight(now: Date = new Date()) {
  const next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0,
  );
  return next.getTime() - now.getTime();
}

export default function ChatDock() {
  const [state, setState] = useState<ChatState>(() => hydrateState());
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const placeholder = useMemo(() => "Ask a question with /plan", []);

  useEffect(() => {
    setState((prev) => {
      const reconciled = reconcileDaily(prev);
      persistState(reconciled);
      return reconciled;
    });
  }, []);

  useEffect(() => {
    persistState(state);
  }, [state]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    let intervalId: number | undefined;
    const timeoutId = window.setTimeout(() => {
      setState((prev) => {
        const reconciled = reconcileDaily(prev);
        persistState(reconciled);
        return reconciled;
      });
      intervalId = window.setInterval(
        () => {
          setState((prev) => {
            const reconciled = reconcileDaily(prev);
            persistState(reconciled);
            return reconciled;
          });
        },
        24 * 60 * 60 * 1000,
      );
    }, msUntilNextMidnight());

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: Date.now(),
    };

    const agentMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "agent",
      content: `Acknowledged. The single agent for the full environment (${AGENT_NAME}) will archive today’s history at local midnight.`,
      timestamp: Date.now(),
    };

    setState((prev) => {
      const reconciled = reconcileDaily(prev);
      const nextState = {
        ...reconciled,
        messages: [...reconciled.messages, userMessage, agentMessage],
      };
      persistState(nextState);
      return nextState;
    });
    setInput("");
  }

  return (
    <section
      style={{
        position: "fixed",
        right: 20,
        bottom: 20,
        width: "min(360px, calc(100vw - 40px))",
        borderRadius: 16,
        border: "1px solid rgba(148, 163, 184, 0.35)",
        background: "rgba(15, 23, 42, 0.95)",
        color: "#e2e8f0",
        boxShadow: "0 16px 40px rgba(15, 23, 42, 0.25)",
        backdropFilter: "blur(14px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 50,
      }}
    >
      <header
        style={{
          padding: "14px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(30, 41, 59, 0.8)",
          borderBottom: "1px solid rgba(148, 163, 184, 0.25)",
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{AGENT_NAME}</div>
          <div style={{ fontSize: 12, color: "rgba(226, 232, 240, 0.7)" }}>
            {ARCHIVE_NOTE}
          </div>
        </div>
        <button
          style={{
            border: "1px solid rgba(148, 163, 184, 0.35)",
            background: "rgba(15, 23, 42, 0.8)",
            color: "inherit",
            borderRadius: 999,
            padding: "6px 12px",
            fontSize: 12,
            cursor: "pointer",
          }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Minimize" : "Chat"}
        </button>
      </header>

      {isOpen ? (
        <>
          <div
            style={{
              maxHeight: 320,
              overflowY: "auto",
              padding: "14px 16px 10px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {state.messages.length === 0 ? (
              <div style={{ fontSize: 12, color: "rgba(226, 232, 240, 0.65)" }}>
                Start a conversation. Your messages are saved and archived
                daily.
              </div>
            ) : (
              state.messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    borderRadius: 12,
                    padding: "10px 12px",
                    background:
                      message.role === "user"
                        ? "rgba(56, 189, 248, 0.25)"
                        : "rgba(30, 41, 59, 0.6)",
                    border: `1px solid ${
                      message.role === "user"
                        ? "rgba(56, 189, 248, 0.4)"
                        : "rgba(148, 163, 184, 0.2)"
                    }`,
                    alignSelf: message.role === "user" ? "flex-end" : "stretch",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "rgba(226, 232, 240, 0.6)",
                      marginBottom: 6,
                    }}
                  >
                    {message.role === "user" ? "You" : AGENT_NAME}
                  </div>
                  <div style={{ fontSize: 13, lineHeight: 1.4 }}>
                    {message.content}
                  </div>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>

          <footer
            style={{
              padding: "12px 16px 16px",
              borderTop: "1px solid rgba(148, 163, 184, 0.25)",
              background: "rgba(15, 23, 42, 0.75)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                borderRadius: 999,
                background: "rgba(45, 45, 45, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <button
                style={{
                  border: "none",
                  background: "rgba(60, 60, 60, 0.9)",
                  color: "#fff",
                  borderRadius: 999,
                  width: 28,
                  height: 28,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 14,
                }}
                type="button"
                aria-label="Add context"
              >
                +
              </button>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={placeholder}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                style={{
                  flex: 1,
                  padding: "8px 4px",
                  border: "none",
                  background: "transparent",
                  color: "inherit",
                  fontSize: 13,
                }}
              />
              <button
                style={{
                  border: "none",
                  background: "rgba(60, 60, 60, 0.9)",
                  color: "#fff",
                  borderRadius: 999,
                  width: 28,
                  height: 28,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 14,
                }}
                type="button"
                aria-label="Record voice note"
              >
                🎤
              </button>
              <button
                style={{
                  border: "none",
                  background: "#4b5563",
                  color: "#fff",
                  borderRadius: 999,
                  width: 28,
                  height: 28,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  fontSize: 14,
                }}
                type="button"
                onClick={sendMessage}
                aria-label="Send message"
              >
                ➤
              </button>
            </div>
          </footer>
        </>
      ) : null}
    </section>
  );
}
