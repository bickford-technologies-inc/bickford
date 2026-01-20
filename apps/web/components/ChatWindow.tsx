"use client";

import { useEffect, useMemo, useState } from "react";

type ChatRole = "user" | "agent";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
};

type ChatArchive = {
  date: string;
  messages: ChatMessage[];
};

type ChatState = {
  currentDate: string;
  messages: ChatMessage[];
  archives: ChatArchive[];
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

function getTodayKey() {
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
  const localToday = getTodayKey();
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

function parseStoredState(raw: string | null): ChatState | null {
  const stored = safeParse<ChatState>(raw);
  if (!stored) {
    return null;
  }
  return migrateUtcDates({
    currentDate: stored.currentDate ?? getTodayKey(),
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

function hydrateState(): ChatState {
  if (typeof window === "undefined") {
    return { currentDate: getTodayKey(), messages: [], archives: [] };
  }

  const stored = parseStoredState(window.localStorage.getItem(STORAGE_KEY));
  if (stored) {
    return stored;
  }

  const legacyDaily = safeParse<ChatState>(
    window.localStorage.getItem(LEGACY_DAILY_KEY),
  );
  if (legacyDaily) {
    return migrateUtcDates({
      currentDate: legacyDaily.currentDate ?? getTodayKey(),
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
    window.localStorage.getItem(LEGACY_HISTORY_KEY),
  );
  const legacyArchives = safeParse<ChatArchive[]>(
    window.localStorage.getItem(LEGACY_ARCHIVE_KEY),
  );
  const legacyDay = window.localStorage.getItem(LEGACY_HISTORY_DAY_KEY);

  return migrateUtcDates({
    currentDate: legacyDay ?? getTodayKey(),
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
  const today = getTodayKey();
  if (state.currentDate === today) {
    return state;
  }

  const archives = [...state.archives];
  if (state.messages.length > 0) {
    archives.unshift({ date: state.currentDate, messages: state.messages });
  }

  return { currentDate: today, messages: [], archives };
}

function persistState(state: ChatState) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.localStorage.removeItem(LEGACY_DAILY_KEY);
  window.localStorage.removeItem(LEGACY_HISTORY_KEY);
  window.localStorage.removeItem(LEGACY_HISTORY_DAY_KEY);
  window.localStorage.removeItem(LEGACY_ARCHIVE_KEY);
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

export default function ChatWindow() {
  const [state, setState] = useState<ChatState>(() => hydrateState());
  const [input, setInput] = useState("");
  const [view, setView] = useState<"chat" | "logs" | "decisions">("chat");
  const [isOpen, setIsOpen] = useState(true);

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
    function handleResume() {
      setState((prev) => {
        const reconciled = reconcileDaily(prev);
        if (reconciled === prev) {
          return prev;
        }
        persistState(reconciled);
        return reconciled;
      });
    }

    window.addEventListener("focus", handleResume);
    window.addEventListener("visibilitychange", handleResume);

    return () => {
      window.removeEventListener("focus", handleResume);
      window.removeEventListener("visibilitychange", handleResume);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function handleStorage(event: StorageEvent) {
      if (event.storageArea !== window.localStorage) {
        return;
      }
      if (event.key && event.key !== STORAGE_KEY) {
        return;
      }
      const nextState = parseStoredState(event.newValue) ?? hydrateState();
      setState(nextState);
    }

    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function appendMessage(role: ChatRole, content: string) {
    const nextMessage: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role,
      content,
      timestamp: Date.now(),
    };

    setState((prev) => {
      const reconciled = reconcileDaily(prev);
      const nextState = {
        ...reconciled,
        messages: [...reconciled.messages, nextMessage],
      };
      persistState(nextState);
      return nextState;
    });
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    setInput("");
    appendMessage("user", trimmed);
    appendMessage(
      "agent",
      `Acknowledged. The single agent for the full environment (${AGENT_NAME}) will archive today’s history at local midnight.`,
    );
  }

  const decisions = useMemo(() => {
    const normalized = state.messages
      .filter((message) => message.role === "user")
      .map((message) => ({
        id: message.id,
        content: message.content,
        key: message.content.trim().toLowerCase(),
      }));
    const counts = normalized.reduce<Record<string, number>>((acc, item) => {
      acc[item.key] = (acc[item.key] ?? 0) + 1;
      return acc;
    }, {});
    return normalized.map((item) => ({
      id: item.id,
      content: item.content,
      conflict: counts[item.key] > 1,
    }));
  }, [state.messages]);
  const logs = useMemo(() => {
    const today = state.messages.length
      ? [{ date: state.currentDate, messages: state.messages }]
      : [];
    return [...today, ...state.archives];
  }, [state.archives, state.currentDate, state.messages]);

  return (
    <aside
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        width: "min(420px, calc(100vw - 48px))",
        maxHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "16px 16px 12px",
        borderRadius: 16,
        background: "rgba(20, 20, 24, 0.92)",
        color: "#f4f4f5",
        boxShadow: "0 20px 40px rgba(15, 23, 42, 0.35)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        zIndex: 1000,
      }}
    >
      <header style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <strong style={{ fontSize: 18 }}>{AGENT_NAME}</strong>
            <span style={{ fontSize: 12, opacity: 0.7 }}>
              {ARCHIVE_NOTE} • today {state.currentDate}
            </span>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            {isOpen ? (
              <>
                <button
                  type="button"
                  onClick={() => setView("chat")}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    background:
                      view === "chat"
                        ? "rgba(59, 130, 246, 0.4)"
                        : "rgba(8, 8, 12, 0.8)",
                    color: "#f4f4f5",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Chat
                </button>
                <button
                  type="button"
                  onClick={() => setView("logs")}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    background:
                      view === "logs"
                        ? "rgba(59, 130, 246, 0.4)"
                        : "rgba(8, 8, 12, 0.8)",
                    color: "#f4f4f5",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Logs
                </button>
                <button
                  type="button"
                  onClick={() => setView("decisions")}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 999,
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    background:
                      view === "decisions"
                        ? "rgba(59, 130, 246, 0.4)"
                        : "rgba(8, 8, 12, 0.8)",
                    color: "#f4f4f5",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  Decisions
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => setIsOpen((open) => !open)}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(8, 8, 12, 0.8)",
                color: "#f4f4f5",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              {isOpen ? "Minimize" : "Open"}
            </button>
          </div>
        </div>
      </header>

      {isOpen ? (
        <>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              overflowY: "auto",
              paddingRight: 4,
              flex: 1,
            }}
          >
            {view === "decisions" ? (
              decisions.length === 0 ? (
                <p style={{ fontSize: 13, opacity: 0.7 }}>
                  No decisions captured yet.
                </p>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {decisions.map((decision) => (
                    <div
                      key={decision.id}
                      style={{
                        padding: "12px 14px",
                        borderRadius: 12,
                        background: "rgba(39, 39, 42, 0.9)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: 0.6,
                          opacity: 0.6,
                        }}
                      >
                        Decision
                      </span>
                      <span style={{ fontSize: 14 }}>{decision.content}</span>
                      <span style={{ fontSize: 12, opacity: 0.7 }}>
                        {decision.conflict
                          ? "Conflict: overlaps with an existing decision"
                          : "Conflict: none"}
                      </span>
                    </div>
                  ))}
                </div>
              )
            ) : view === "logs" ? (
              logs.length === 0 ? (
                <p style={{ fontSize: 13, opacity: 0.7 }}>
                  No archived days yet. Start chatting to build a daily log.
                </p>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {logs.map((archive) => (
                    <div
                      key={archive.date}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        padding: "10px 12px",
                        borderRadius: 12,
                        background: "rgba(39, 39, 42, 0.9)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: 0.6,
                          opacity: 0.6,
                        }}
                      >
                        {archive.date}
                      </span>
                      {archive.messages.map((message) => (
                        <div
                          key={message.id}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            padding: "8px 10px",
                            borderRadius: 10,
                            background:
                              message.role === "user"
                                ? "rgba(59, 130, 246, 0.5)"
                                : "rgba(24, 24, 27, 0.9)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: 11,
                              textTransform: "uppercase",
                              letterSpacing: 0.4,
                              opacity: 0.65,
                            }}
                          >
                            {message.role === "user" ? "You" : AGENT_NAME}
                          </span>
                          <span style={{ fontSize: 13, lineHeight: 1.4 }}>
                            {message.content}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )
            ) : state.messages.length === 0 ? (
              <p style={{ fontSize: 13, opacity: 0.7 }}>
                Start a thread. Your messages are saved and archived daily.
              </p>
            ) : (
              state.messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignSelf:
                      message.role === "user" ? "flex-end" : "flex-start",
                    gap: 4,
                    maxWidth: "85%",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                      opacity: 0.6,
                    }}
                  >
                    {message.role === "user" ? "You" : AGENT_NAME}
                  </span>
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 12,
                      background:
                        message.role === "user"
                          ? "rgba(59, 130, 246, 0.9)"
                          : "rgba(39, 39, 42, 0.9)",
                    }}
                  >
                    <span style={{ fontSize: 14, lineHeight: 1.4 }}>
                      {message.content}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {view === "decisions" ? null : (
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <select
                aria-label="Intent"
                defaultValue="intent-question"
                style={{
                  padding: "8px 10px",
                  borderRadius: 999,
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  background: "rgba(39, 39, 42, 0.9)",
                  color: "#f4f4f5",
                  fontSize: 12,
                }}
              >
                <option value="intent-question">Intent: Question</option>
                <option value="intent-decision">Intent: Decision</option>
                <option value="intent-plan">Intent: Plan</option>
              </select>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Share a thought or decision..."
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  background: "rgba(8, 8, 12, 0.8)",
                  color: "#f4f4f5",
                  fontSize: 14,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "#22c55e",
                  color: "#0f172a",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Send
              </button>
            </form>
          )}
        </>
      ) : null}
    </aside>
  );
}
